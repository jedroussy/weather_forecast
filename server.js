var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname;
    var fileName = path.join(process.cwd(),uri);

    try {
        state = fs.lstatSync(fileName);
    } catch(e) {
        res.writeHead(404 , {'Content-Type' : 'text/plain'});
        res.write('not found');
        res.end();
        return;
    }
    var mimTypes = {
        "html" : "text/html",
        "jpeg" : "image/jpeg",
        "jpg" : "image/jpeg",
        "png" : "image/png",
        "js" : "text/javascript",
        "css" : "text/css"
    }

    if(state.isFile()) {
        mimType = mimTypes[path.extname(fileName).split('.').reverse()[0]];
        res.writeHead(200, {'Content-Type' : mimType});
        // fs.readFile(fileName, function (err, data) {
        //     if (err) throw err;
        //
        //     res.write(data);
        //     res.end();
        // });
        var fileStream = fs.createReadStream(fileName);
        fileStream.pipe(res);
    } else if(state.isDirectory()) {
        res.writeHead(302 , {
           'Location' : '/view/index.html'
        });
        res.end();
    } else {
        res.writeHead(500 , {'Content-Type' : 'text/plain'});
        res.write('500 Internal Error');
        res.end();
    }

}).listen(3000);
console.log('server runnig at locahost:3000');