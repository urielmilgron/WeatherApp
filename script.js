import API_KEY from './APIConfig.js';
console.log(API_KEY)
let containerWheater = document.getElementsByClassName("containerWeather")

let weatherDAys

fetch(`http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=Buenos Aires&days=7`)
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error))

