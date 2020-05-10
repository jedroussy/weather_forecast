var http = require('http');
var router = require('./router');

http.createServer(function(request , response){
    if (request.url === '/favicon.ico') {
        response.writeHead(200, {'Content-Type': 'image/x-icon'} );
        response.end();
        console.log('favicon requested');
        return;
      }
   
    // localhost:3001
    router.phome(request,response);

    // localhost:3001/babol
    router.pforecast(request,response);


}).listen(3066 , function(){
    console.log('server running at localhost:3001');
});


