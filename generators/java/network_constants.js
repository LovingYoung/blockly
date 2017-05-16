/**
 * Created by jaceliu on 14/05/2017.
 */

'use strict';

goog.require('Blockly.Java');

goog.provide('Blockly.Java.network_constants');


Blockly.Java['network_static_ip'] = function(block) {
  var IP_1 = block.getFieldValue('IP_1');
  var IP_2 = block.getFieldValue('IP_2');
  var IP_3 = block.getFieldValue('IP_3');
  var IP_4 = block.getFieldValue('IP_4');
  return ["IPv4.toIPv4Address(" + '\"' + IP_1 + '.' + IP_2 + '.' + IP_3 + '.' + IP_4 + "\")", Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['network_TYPE_IPv4'] = function (block) {
  return ["Ethernet.TYPE_IPv4", Blockly.Java.ORDER_ATOMIC];
};
