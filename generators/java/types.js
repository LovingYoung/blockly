/**
 * Created by lovingyoung on 17-5-27.
 */

'use strict';

goog.require("Blockly.Java");
goog.provide("Blockly.Java.Types");

Blockly.Java["type_struct"] = function (block) {
  var structName = block.getFieldValue("NAME");
  var code, info;
  [code, info] = Blockly.Java.statementToCode(block, "PROPERTIES");
  code = "private class " + structName + "{\n" + code + "}";
  return [code, info];
};

Blockly.Java["type_property"] = function (block) {
  var propertyName = block.getFieldValue("NAME");
  var propertyType = Blockly.Java.valueToCode(block, "TYPE", Blockly.Java.ORDER_ATOMIC);
  var code = "public " + propertyType + " " + propertyName + ";\n";
  return [code, {}];
};

Blockly.Java["type_primitive"] = function (block) {
  var type = block.getFieldValue("TYPE");
  var order = Blockly.Java.ORDER_ATOMIC;
  if(type === "INT") return ["int", order];
  else if(type === "DOUBLE") return ["double", order];
  else if(type === "CHAR") return ["char", order];
  else return ["String", order];
};

Blockly.Java["type_array"] = function (block) {
  var originType = Blockly.Java.valueToCode(block, "TYPE", Blockly.Java.ORDER_ATOMIC);
  return ["ArrayList<" + originType + ">", Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java["type_map"] = function (block) {
  var type_key = Blockly.Java.valueToCode(block, "TYPE_KEY", Blockly.Java.ORDER_ATOMIC);
  var type_value = Blockly.Java.valueToCode(block, "TYPE_VALUE", Blockly.Java.ORDER_ATOMIC);
  return ["HashMap<" + type_key + "," + type_value+ ">", Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java["type_set"] = function (block) {
  var originType = Blockly.Java.valueToCode(block, "TYPE", Blockly.Java.ORDER_ATOMIC);
  return ["HashSet<" + originType + ">", Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java["type_generic"] = function (block) {
  var type = block.getFieldValue("NAME");
  return [type, Blockly.Java.ORDER_ATOMIC];
};
