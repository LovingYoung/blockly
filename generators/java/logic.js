/**
 * Created by jaceliu on 13/05/2017.
 */
'use strict';

goog.provide('Blockly.Java.logic');

goog.require('Blockly.Java');

Blockly.Java['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode, info, info_whole = {};
  do {
    conditionCode = Blockly.Java.valueToCode(block, 'IF' + n,
        Blockly.Java.ORDER_NONE) || 'false';
    [branchCode, info] = Blockly.Java.statementToCode(block, 'DO' + n);
    code += (n > 0 ? ' else ' : '') +
      'if (' + conditionCode + ') {\n' + branchCode + '}';
    ++n;
    info = infoModify(info, 1);
    Object.assign(info_whole, info);
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    code += ' else {\n';
    [branchCode, info] = Blockly.Java.statementToCode(block, 'ELSE');
    info = infoModify(info, getNumberOfBreaks(code));
    Object.assign(info_whole, info);
    code += branchCode + '}';
  }
  return [code + '\n', info_whole];
};

Blockly.Java['controls_ifelse'] = Blockly.Java['controls_if'];

Blockly.Java['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
    Blockly.Java.ORDER_EQUALITY : Blockly.Java.ORDER_RELATIONAL;
  var argument0 = Blockly.Java.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Java['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Java.ORDER_LOGICAL_AND :
    Blockly.Java.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Java.valueToCode(block, 'A', order);
  var argument1 = Blockly.Java.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Java['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Java.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.Java.valueToCode(block, 'BOOL', order) ||
    'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Java['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Java.valueToCode(block, 'IF',
      Blockly.Java.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Java.valueToCode(block, 'THEN',
      Blockly.Java.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Java.valueToCode(block, 'ELSE',
      Blockly.Java.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Java.ORDER_CONDITIONAL];
};
