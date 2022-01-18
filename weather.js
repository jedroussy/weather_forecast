var https = require('https');
var unirest = require("unirest");



function getLocation(location , callback , error) {
   

    var uri='https://api.opencagedata.com/geocode/v1/json?q='+ location +'&key=dd6dadaec7e04012abb2c6142e8274e1';
    console.log(uri)
    https.get(uri ,function(res){
        var body = '';
        res.on('data' , function (data) {
            body += data;
            
        });

        res.on('end' , function (){
            var google = JSON.parse(body);
            for( var key in google) {
                if(google.status.message == 'OK') {
                    var lat  = google.results[0].geometry.lat;
                    var lng = google.results[0].geometry.lng;
                    callback(lat,lng);
                    break;
                }
            }
        });

        res.on('error' , function (err) {
            error(err);
        });

    });
}


function getWeather(lat , lng , success , error) {

    var urw='https://api.forecast.io/forecast/5468ad0689ff0d1b3a3a2470798ea50c/'+ lat + ',' + lng +'?units=si';
    console.log(urw)
    https.get(urw,function(res){
        var body = '';
        res.on('data', function (data) {
            body += data;
        });

        res.on('end' , function(){
            var weather = JSON.parse(body);
            success(weather);
        });

        res.on('error' , function (err) {
            error(err);
        });
    });

}


module.exports.getLocation = getLocation;
module.exports.getWeather = getWeather;
