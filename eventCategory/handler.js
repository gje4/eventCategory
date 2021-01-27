"use strict";
const request = require("request-promise");
const BigCommerce = require("node-bigcommerce");

const bigCommerce = new BigCommerce({
  logLevel: "info",
  clientId: process.env.BC_CLIENT,
  accessToken: process.env.BC_TOKEN,
  storeHash: process.env.STORE_HASH,
  responseType: "json",
  apiVersion: "v3"
});

async function getProducts(catID) {
  console.log("whats the weather", catID);

  //include_fields to limit data returned, this can be modified to add other fields or removed if wanting all data
  var catData = await bigCommerce.get(
    `/catalog/products?categories:in=${catID}&limit=7&include_fields=name,sku,price,description,variants`
  );
  console.log("catData", catData);
  return catData;
}

async function getWeatherByZip(zipCode) {
  var temps = [];
  var weatherDesc = [];
  const options = {
    method: "GET",
    uri: `http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},US&&units=imperial&cnt=7&appid=${process.env.WEATHER_TOKEN}`,
    headers: {
      accept: "application/json"
    }
  };
  var weatherData = await request(options);
  console.log("transaction", JSON.parse(weatherData));
  var weekly = JSON.parse(weatherData);
  var weather = weekly.list;
  weather.forEach(function(weather) {
    temps.push(weather.main.temp);
    console.log("main", weather.weather);
    weatherDesc.push(weather.weather);
  });

  console.log("temps", temps);
  const sum = temps.reduce((a, b) => a + b, 0);
  const avg = sum / temps.length || 0;
  console.log("avg", avg);

  console.log("weatherDesc", weatherDesc);

 
  return { weatherDesc, avg, temps };
}


module.exports.eventCategory = async event => {
  let returnValue = {
    statusCode: 500,
    body: JSON.stringify({
      status: 500,
      message: `Something went wrong.`
    })
  };

  console.log("data", event.zipCode);
  try {
    const { weatherDesc, avg, temps } = await getWeatherByZip(event.zipCode);
    console.log("averagetemp", avg);

    //fetch products based on averagetemp
    var categoryID;

    //working if statement with temperature ranges only
    if (avg <= 40 ) {
      categoryID = 24;
    } else if (avg > 40 && avg <= 60) {
      categoryID = 26;
    } else if (avg > 60) {
      categoryID = 25; 
    } else {
      console.log("no cat for this temp");
    }

    //combined if statement with temperature ranges and weatherDesc
    // if (weatherDesc[0][0].main == "rain" ) {
    //   categoryID = 26;
    // } else if (weatherDesc[0][0].main == "snow" ) {
    //   categoryID = 24;
    // } else if (avg > 40 && avg <= 60) {
    //   categoryID = 26;
    // } else if (avg > 60) {
    //   categoryID = 25; 
    // } else {
    //   console.log("no cat for this temp");
    // }

    const products = await getProducts(categoryID);

    returnValue = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify("Products", weatherDesc, temps, avg, products)
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
