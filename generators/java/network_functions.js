/**
 * Created by jaceliu on 14/05/2017.
 */

'use strict';

goog.require("Blockly.Java");

goog.provide("Blockly.Java.network_functions");


Blockly.Java['network_onPacket'] = function(block) {
  var funcName = 'onPacket';
  var branch, info;
  [branch, info] = Blockly.Java.statementToCode(block, 'DO');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
        Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
          '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  info = infoModify(info, 2);
  info[2] = {type: "onPacket", id: block.id};
  var code = "@Override\npublic void "+ funcName + " (MaplePacket pkt) { \n" + branch + '}';
  return [code, info];
};

Blockly.Java['network_IPv4SrcIs'] = function(block) {
  var arg = Blockly.Java.valueToCode(block, "IP", Blockly.Java.ORDER_NONE);
  var code = "pkt.IPv4SrcIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_IPv4DstIs'] = function(block) {
  var arg = Blockly.Java.valueToCode(block, "IP", Blockly.Java.ORDER_NONE);
  var code = "pkt.IPv4DstIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_setRoute'] = function(block) {
  var arg = Blockly.Java.valueToCode(block, "Route", Blockly.Java.ORDER_NONE);
  var code = "pkt.setRoute(" + arg + ");\n";
  var info = {};
  info[1] = {type: "Set Route", id: block.id};
  return [code, info];
};

Blockly.Java['network_TCPSrcPortIs'] = function (block) {
  var arg = Blockly.Java.valueToCode(block, "Port", Blockly.Java.ORDER_NONE);
  var code = "pkt.TCPSrcPortIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_TCPDstPortIs'] = function (block) {
  var arg = Blockly.Java.valueToCode(block, "Port", Blockly.Java.ORDER_NONE);
  var code = "pkt.TCPDstPortIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_DROP'] = function (block) {
  return ['Route.DROP', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['network_PassToNext'] = function (block) {
  statement_lines += 1;
  return ["passToNext(pkt);", {1:{type: "Pass To Next", id: block.id}}];
};
