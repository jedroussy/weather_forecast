var http = require('http');
var fs = require('fs');

// Sync | aSync

var data1 = null;
var req = http.get('http://roocket.ir/client/data', 
                    function(res){
                                  res.on('data',function (data) {data1 = data;});
                                  res.on('end', function(){
                                                          fs.writeFile(process.cwd() +'\\file.txt' , data1 , function (err) {if(err) console.log(err);});
                                                          fs.writeFile(process.cwd() +'\\file.txt' , 'sdfsdfsdfsdfsdfsf' , function (err) {if(err) console.log(err);});
                                                          }
                                        );
                                 }
                  );
req.on('error', function (err) {console.log(err);});



var Ali= http.createServer(function (req, res) {
    if(req.method == 'GET') {
        if(req.url == '/view/index.html'){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write("The date and time are currently: " + Date());
            res.end();
        }}
    
}).listen(8080); 
