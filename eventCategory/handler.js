"use strict";
const request = require("request-promise");
const BigCommerce = require("node-bigcommerce");

const bigCommerce = new BigCommerce({
  logLevel: "info",
  clientId: process.env.BC_CLIENT,
  accessToken: process.env.BC_TOKEN,
  storeHash: process.env.STORE_HASH,
  responseType: "json",
  apiVersion: "v2"
});

async function getOrderData(orderDataId) {
  var orderData = await bigCommerce.get(`/orders/${orderDataId}`);
  return orderData;
}

async function getTransactionId(orderDataId) {
  const options = {
    method: "GET",
    uri: `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/orders/${orderDataId}/transactions`,
    headers: {
      accept: "application/json",
      "X-Auth-Client": process.env.BC_CLIENT,
      "X-Auth-Token": process.env.BC_TOKEN
    }
  };
  var transactionData = await request(options);
  console.log("transaction", transactionData);
  return transactionData;
}


module.exports.eventCategory = async event => {
  let returnValue = {
    statusCode: 500,
    body: JSON.stringify({
      status: 500,
      message: `Something went wrong.`
    })
  };
  let data = JSON.parse(event.body);
  //get order order data
  try {


    returnValue = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify("Checked for subscription")
    };
  } catch (err) {
    returnValue = {
      statusCode: 500,
      body: JSON.stringify({
        status: 500,
        message: `Something went wrong.`
      })
    };
  }
  return returnValue;
};
