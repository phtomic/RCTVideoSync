const express = require ('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Htime=0;
var epN=1;
var host=""
var rooms={};
var rCount=0;
var episode='';
io.on('connection', function(socket){
  socket.on('response', function(msg){
    switch(msg.type){
      case "ss":
        if(host==msg.data.host){
          console.log("pause/play")
          console.log(msg)
          msg.type="sst";
          io.emit('message',msg);
          Htime=msg.data.time;
        }
        break;
      case "getTime":
        console.log("GetTime")
        console.log(msg)
        var ext={type:"hostTime",data:{time:Htime,src:episode,host:"server"}};
        io.emit('message',ext);
        break;
      case "seek":
        console.log("seek")
        console.log(msg)
        Htime=msg.data.time;
        io.emit('message',{type:"hostTime",data:{time:Htime,host:"server"}});
        break;
      case "srcNext":
        episode=msg.data;
        host=msg.host
        console.log("New Host: "+host)
        io.emit('message',{type:"src",data:{src:episode,host:"server"}})
        Htime=0;
        break;
      case "changeH":
        
        break;
    }
  });
});
 let serverPort=process.env.PORT || 8080;
// inicia o servidor na porta informada, no caso vamo iniciar na porta 3000
http.listen(serverPort, function(){
  console.log('Servidor rodando em: http://localhost:'+serverPort);
});