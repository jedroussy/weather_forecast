var weather = require('./weather');
var render = require('./render');
var querystring = require('querystring');

function Home(request , response) {
    if(request.url == '/') {
        if(request.method.toLowerCase() === "get") {
            response.writeHead(200 , {'Content-Type' : 'text/html'});
            render.view("location" , {"title" : "forecast Website"} , response);
            response.end();
        } else {
            // get data
            request.on('data' , function (PostBody) {
                var query = querystring.parse(PostBody.toString());
                response.writeHead(302 , {"Location" : "/" + query.location});
                response.end();
            });
            // localhost:3000/babol
        }
    }
}


function Forecast(request , response) {
    var location = request.url.replace("/","");
    if(location.length > 0) {
        // response.writeHead(200 , {'Content-Type' : 'text/plain'});
        // response.write('route forecast');
        // response.end();
        weather.getLocation(location , function (lat , lng) {
            weather.getWeather(lat ,lng , function(data) {
                var weath = data.daily.data;
                response.writeHead(200,{'Content-Type' : 'text/html'});
                render.view('forecast/header' , { title: location} , response);
                weath.forEach(function (item , index) {
                    render.view('forecast/weather' , {
                        time: item.time,
                        icon: item.icon,
                        tempMax: Math.round(item.temperatureMax),
                        tempMin: Math.round(item.temperatureMin)
                    }, response);
                });
                render.view('forecast/footer' , {} , response);
                response.end();
            } , error);
        } , error);
    }
}

function error(err) {
    if(err) console.log(err);
}

module.exports.home = Home;
module.exports.forecast = Forecast;