
var http = require('http');
var Ali= http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("The date and time are currently: " + Date());
    res.end();
}).listen(8080); 
