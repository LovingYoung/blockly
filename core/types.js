/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2014 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use Blockly.Types file except in compliance with the License.
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
 * @fileoverview Define types
 * @author ly950710@gmail.com (Jace liu)
 */

'use strict';

/**
 * @name Blockly.Types
 * @namespace
 **/
goog.provide('Blockly.Types');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');

goog.require('goog.asserts');


/**
 * Constant to separate procedure names from variables and generated functions
 * when running generators.
 * @deprecated Use Blockly.TYPE_CATEGORY_NAME
 */
Blockly.Types.NAME_TYPE = Blockly.TYPE_CATEOGORY_NAME;

/**
 * Store the list of types
 * @type {Array}
 * @private
 */
Blockly.Types.ListOfTypes_ = [];

/**
 * Function to add a new type
 * @param {string} type
 * @param {function} [opt_callback]
 */
Blockly.Types.addType = function (type, opt_callback) {
  if(Blockly.Types.ListOfTypes_.indexOf(type) === -1) {
    Blockly.Types.ListOfTypes_.push(type);
  }
  if(opt_callback)
    opt_callback();
};

/**
 * Function to remove a type
 * @param {string} type
 * @param {function} [opt_callback]
 */
Blockly.Types.removeType = function (type, opt_callback) {
  if(!Blockly.Types.nameCount(type))
    goog.array.remove(Blockly.Types.ListOfTypes_, type);
  if(opt_callback)
    opt_callback();
};

/**
 * Function to get types
 * @param {function} [opt_callback]
 * @returns {Array}
 */
Blockly.Types.getTypes = function(opt_callback){
  if(opt_callback) opt_callback();
  return Blockly.Types.ListOfTypes_;
};

/**
 * To return the count of Blockly.Types name
 * @param {number} name
 * @returns {number} the count of Blockly.Types name
 */
Blockly.Types.nameCount = function (name) {
  var blocks = workspace.getTopBlocks();
  var result = 0;
  for(var i = 0; i < blocks.length; i++){
    if(blocks[i].getFieldValue("NAME") === name)
      result += 1;
  }
  return result;
};

/**
 * used to rename a type.
 * @param {string} oldType
 * @param {string} newType
 * @param {function} [opt_callback]
 */
Blockly.Types.renameType = function (oldType, newType, opt_callback) {
  if(!Blockly.Types.nameCount(oldType)){
    Blockly.Types.removeType(oldType);
  }
  Blockly.Types.addType(newType);
  if(opt_callback)
    opt_callback();
};

/**
 * define an onchange callback
 * @param {object} event
 */
Blockly.Types.typeCallback = function (event) {
  if(event instanceof Blockly.Events.Create){
    var blockId = event.blockId;
    var block = workspace.getBlockById(blockId);
    if(block && block["type"] === "type_struct"){
      var name = block.getFieldValue("NAME");
      if(Blockly.Types.nameCount(name) <= 1)
        Blockly.Types.addType(name);
    }
  }
  if(event instanceof Blockly.Events.Change){
    var blockId = event.blockId;
    var block = workspace.getBlockById(blockId);
    if(block && block["type"] == "type_struct"){
      Blockly.Types.renameType(event.oldValue, event.newValue);
    }
  }
  if(event instanceof Blockly.Events.Delete){
    var block = event.block;
    if(block && block["type"] == "type_struct"){
      var name = block.getFieldValue("NAME");
      if(!Blockly.Types.nameCount(name)){
        Blockly.Types.removeType(name);
      }
    }
  }
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Types.flyoutCategory = function(workspace) {
  var xmlList = [];
  if (Blockly.Blocks['type_primitive']) {
    // <block type="type_primitive" gap="10">
    //     <field name="TYPE">INT</field>
    // </block>
    var block = goog.dom.createDom('block');
    block.setAttribute('type', 'type_primitive');
    block.setAttribute('gap', 16);
    var nameField = goog.dom.createDom('field', null,
      "INT");
    nameField.setAttribute('name', 'TYPE');
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['type_array']) {
    var block = goog.dom.createDom('block');
    block.setAttribute('type', 'type_array');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (Blockly.Blocks['type_set']) {
    var block = goog.dom.createDom('block');
    block.setAttribute('type', 'type_set');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (Blockly.Blocks['type_map']) {
    var block = goog.dom.createDom('block');
    block.setAttribute('type', 'type_map');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  for(var i = 0; i < Blockly.Types.ListOfTypes_.length; i++){
    // <block type="type_generic" gap="16">
    //   <mutation name="do something">
    //     <arg name="x"></arg>
    //   </mutation>
    // </block>
    var block = goog.dom.createDom('block');
    block.setAttribute("type", "type_generic");
    block.setAttribute("gap", 16);
    var mutation = goog.dom.createDom("mutation")
    mutation.setAttribute("name", Blockly.Types.ListOfTypes_[i]);
    block.appendChild(mutation);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Jace: Add custom types here
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }
  return xmlList;
};
