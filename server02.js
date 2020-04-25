var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var mongoose= require('mongoose');

mongoose.connect('mongodb://localhost/NodeCourse', 
    {   useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true, 
        useFindAndModify: false
    },
    (err, res) => {if (err) throw err; console.log('Database online');}
);
var cUser = require('./model/cuser');

http.listen(3003,function(){console.log('Server is running on port 3003');});

app.get('/', (req, res)=>{res.sendFile(__dirname + '/socket.html');});

io.on('connection', (socket)=>{
    console.log('a new user connection');

    socket.on('new user', (data, callback)=>{
        console.log(data);
        /////////////////////////////////////////////////////////////
        cUser.findOne({email: data.email}, function(err, user){
            if(err){throw err;}
            if(!user){
                console.log('new username saved!');
                var user1 =new cUser({
                    name: data.name,
                    email: data.email
                });
                user1.save((err,user)=>{
                    if(err) throw err;
                    if(!user) {callback(false); return;}
                    callback(true);
                    socket.username = user.name;
                    socket._id= user._id;
                    io.emit('new user', {username: socket.username});
                });
                return;
            };
            callback(true);
            socket.username = user.name;
            socket._id= user._id;
            //console.log(socket.username);
            io.emit('new user', {username: socket.username});
            


        });


        
    })
    socket.on('new message',(data)=>{
        io.emit('new message',{message: data, user:{
            //id: socket.id.slice(2),
            id: socket.id,
            name: socket.username
        }});
    })
    socket.on('disconnect', ()=>{
        console.log('a user disconnected');
        cUser.findByIdAndRemove(socket._id, (err)=>{ if(err) throw err;});
    })
});