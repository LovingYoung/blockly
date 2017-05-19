/**
 * Created by jaceliu on 14/05/2017.
 */

'use strict';

goog.require("Blockly.Java");

goog.provide("Blockly.Java.network_functions");


Blockly.Java['network_onPacket'] = function(block) {
  var funcName = 'onPacket';
  var branch = Blockly.Java.statementToCode(block, 'DO');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
        Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
          '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var code = "@Override\npublic void "+ funcName + " (MaplePacket pkt) { \n" + branch + '}';
  return code;
};

Blockly.Java['network_IPv4SrcIs'] = function(block) {
  var arg = Blockly.Java.statementToCode(block, "IP").trim();
  var code = "pkt.IPv4SrcIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_IPv4DstIs'] = function(block) {
  var arg = Blockly.Java.statementToCode(block, "IP").trim();
  var code = "pkt.IPv4DstIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_setRoute'] = function(block) {
  var arg = Blockly.Java.statementToCode(block, "Route").trim();
  var code = "pkt.setRoute(" + arg + ");";
  return code;
};

Blockly.Java['network_TCPSrcPortIs'] = function (block) {
  var arg = Blockly.Java.statementToCode(block, "Port").trim();
  var code = "pkt.TCPSrcPortIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_TCPDstPortIs'] = function (block) {
  var arg = Blockly.Java.statementToCode(block, "Port").trim();
  var code = "pkt.TCPDstPortIs(" + arg + ")";
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['network_DROP'] = function (block) {
  return 'Route.DROP';
};

Blockly.Java['network_PassToNext'] = function (block) {
  return "passToNext(pkt);"
}
