
/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Java for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Java');

goog.require('Blockly.Generator');


/**
 * Java code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Java = new Blockly.Generator('Java');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Java.addReservedWords(
  // import keyword
  // print ','.join(keyword.kwlist)
  // http://en.wikipedia.org/wiki/List_of_Java_keywords
  'abstract,assert,boolean,break,case,catch,class,const,continue,default,do,double,else,enum,' +
  'extends,final,finally,float,for,goto,if,implements,import,instanceof,int,interface,long,native,' +
  'new,package,private,protected,public,return,short,static,strictfp,super,switch,synchronized,' +
  'this,throw,throws,transient,try,void,volatile,while,' +
  //http://en.wikipedia.org/wiki/List_of_Java_keywords#Reserved_words_for_literal_values
  'false,null,true,' +
  // http://docs.Java.org/library/functions.html
  'abs,divmod,input,open,staticmethod,all,enumerate,int,ord,str,any,eval,isinstance,pow,' +
  'sum,basestring,execfile,issubclass,print,super,bin,file,iter,property,tuple,bool,filter,' +
  'len,range,type,bytearray,float,list,raw_input,unichr,callable,format,locals,reduce,unicode,' +
  'chr,frozenset,long,reload,vars,classmethod,getattr,map,repr,xrange,cmp,globals,max,reversed,' +
  'zip,compile,hasattr,memoryview,round,__import__,complex,hash,min,set,apply,delattr,help,next,' +
  'setattr,buffer,dict,hex,object,slice,coerce,dir,id,oct,sorted,intern,equal'
);

/**
 * Order of operation ENUMs.
 * https://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html
 */
Blockly.Java.ORDER_ATOMIC = 0;      // 0 "" ...
Blockly.Java.ORDER_COLLECTION = 1;    // tuples, lists, dictionaries
Blockly.Java.ORDER_STRING_CONVERSION = 1; // `expression...`

Blockly.Java.ORDER_MEMBER = 2;      // . []
Blockly.Java.ORDER_FUNCTION_CALL = 2;   // ()

Blockly.Java.ORDER_POSTFIX = 3;       // expr++ expr--
Blockly.Java.ORDER_EXPONENTIATION = 3;  // **

Blockly.Java.ORDER_LOGICAL_NOT = 3;     // not
Blockly.Java.ORDER_UNARY_SIGN = 4;    // ++expr --expr +expr -expr ~ !
Blockly.Java.ORDER_MULTIPLICATIVE = 5;  // * / %
Blockly.Java.ORDER_ADDITIVE = 6;      // + -
Blockly.Java.ORDER_BITWISE_SHIFT = 7;   // << >> >>>
Blockly.Java.ORDER_RELATIONAL = 8;    // < > <= >= instanceof
Blockly.Java.ORDER_EQUALITY = 9;      // == !=
Blockly.Java.ORDER_BITWISE_AND = 10;    // &
Blockly.Java.ORDER_BITWISE_XOR = 11;    // ^
Blockly.Java.ORDER_BITWISE_OR = 12;     // |
Blockly.Java.ORDER_LOGICAL_AND = 13;    // &&
Blockly.Java.ORDER_LOGICAL_OR = 14;     // ||
Blockly.Java.ORDER_CONDITIONAL = 15;    // ? :

Blockly.Java.ORDER_ASSIGNMENT = 16;  // = += -= *= /= %= &= ^= |= <<= >>= >>>=
Blockly.Java.ORDER_COMMA = 17; // ,

Blockly.Java.ORDER_NONE = 99;       // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.Java.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.Java.ORDER_FUNCTION_CALL, Blockly.Java.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.Java.ORDER_FUNCTION_CALL, Blockly.Java.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.Java.ORDER_MEMBER, Blockly.Java.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.Java.ORDER_MEMBER, Blockly.Java.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Blockly.Java.ORDER_LOGICAL_NOT, Blockly.Java.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Blockly.Java.ORDER_MULTIPLICATION, Blockly.Java.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.Java.ORDER_ADDITION, Blockly.Java.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.Java.ORDER_LOGICAL_AND, Blockly.Java.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.Java.ORDER_LOGICAL_OR, Blockly.Java.ORDER_LOGICAL_OR]
];

/**
 * Store the app name
 */
Blockly.Java.AppName_ = "MapleApp";

/**
 * Store the packege name
 */
Blockly.Java.Package_ = "demo";

/**
 * Store variables and types
 */
Blockly.Java.blocklyTypes_ = {};

/**
 * Set the application name
 * @param {string} name Name for the application
 */
Blockly.Java.setAppName = function(name) {
  if(!name || name === '') {
    name = 'MapleApp';
  }
  Blockly.Java.AppName_ = name;
};

/**
 * Set the package for this generated Java code
 * @param {string} javaPackage Name of the package this is derived from
 */
Blockly.Java.setPackage = function(javaPackage) {
  if (!javaPackage || javaPackage === '') {
    javaPackage = 'demo';
  }
  Blockly.Java.Package_ = javaPackage;
};

/**
 * Get the packege name
 * @return {string} package name of the application
 */
Blockly.Java.getPackage = function() {
  return Blockly.Java.Package_;
};

/**
 * Package, imports, class
 */
var skeleton =
  "/*\n" +
  " * Copyright © 2015 SNLAB and others.  All rights reserved.\n" +
  " *\n" +
  " * This program and the accompanying materials are made available under the\n" +
  " * terms of the Eclipse Public License v1.0 which accompanies this distribution,\n" +
  " * and is available at http://www.eclipse.org/legal/epl-v10.html\n" +
  " */\n\n" +
  "package org.opendaylight.mapleapp.impl;\n" +
  "\n"+
  "import org.opendaylight.maple.core.increment.app.MapleAppBase;\n" +
  "import org.opendaylight.maple.core.increment.packet.Ethernet;\n" +
  "import org.opendaylight.maple.core.increment.packet.IPv4;\n" +
  "import org.opendaylight.maple.core.increment.tracetree.MaplePacket;\n" +
  "import org.opendaylight.maple.core.increment.tracetree.Route;\n" +
  "\n" +
  "class SDNSolution extends MapleAppBase {\n";

/**
 * End of generator code
 */
var skeleton_end = "}";

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Java.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Java.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Java.functionNames_ = Object.create(null);
  // Create a dictionary of all libraries which would be needed
  Blockly.Java.imports_ = Object.create(null);

  if (!Blockly.Java.variableDB_) {
    Blockly.Java.variableDB_ =
      new Blockly.Names(Blockly.Java.RESERVED_WORDS_);
  } else {
    Blockly.Java.variableDB_.reset();
  }

  var defvars = [];
  var variables = workspace.variableList;
  if (variables.length) {
    for (var i = 0; i < variables.length; i++) {
      // defvars[i] = Blockly.Java.variableDB_.getName(variables[i], Blockly.Variables.NAME_TYPE);
      var split = variables[i].split('-');
      var type = split[0]; var name = split[1];
      Blockly.Java.blocklyTypes_[name] = type;
    }
    // Blockly.Java.definitions_['variables'] = 'var ' + defvars.join(', ') + ';';
    Blockly.Java.definitions_['variables'] = '';
    defvars = Object.keys(Blockly.Java.blocklyTypes_);
    for(var i = 0; i < defvars.length; i++){
      Blockly.Java.definitions_['variables'] +=
        ("private " + Blockly.Java.blocklyTypes_[defvars[i]] + ' ' + defvars[i] +';\n');
    }
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Java.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.Java.definitions_) {
    definitions.push(Blockly.Java.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.Java.definitions_;
  delete Blockly.Java.functionNames_;
  Blockly.Java.variableDB_.reset();
  return skeleton + "\n" + definitions.join('\n') + '\n' + code + "\n" + skeleton_end +"\n";
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Java.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Java string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Java string.
 * @private
 */
Blockly.Java.quote_ = function(string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  string = string.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\\n')
    .replace(/'/g, '\\\'');
  return '\"' + string + '\"';
};

/**
 * Common tasks for generating Java from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Java code created for this block.
 * @return {string} Java code with comments and subsequent blocks added.
 * @private
 */
Blockly.Java.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.Java.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '/**\n' +
          Blockly.Java.prefixLines(comment + '\n', ' * ') +
          ' */\n';
      } else {
        commentCode += Blockly.Java.prefixLines(comment + '\n', '// ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Java.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Java.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Java.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number} result
 */
Blockly.Java.getAdjusted = function(block, atId, opt_delta, opt_negate,
                      opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.Java.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.Java.valueToCode(block, atId,
        Blockly.Java.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.Java.valueToCode(block, atId,
        Blockly.Java.ORDER_SUBTRACTION) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.Java.valueToCode(block, atId,
        Blockly.Java.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.Java.valueToCode(block, atId, order) ||
      defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseFloat(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.Java.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.Java.ORDER_SUBTRACTION;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.Java.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};
