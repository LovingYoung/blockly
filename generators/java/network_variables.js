/**
 * Created by lovingyoung on 17-5-15.
 */

'use strict';

goog.require("Blockly.Java");

goog.provide("Blockly.Java.network_variables");

Blockly.Java['network_ethType'] = function () {
  return ["pkt.ethType()", Blockly.Java.ORDER_ATOMIC];
};
