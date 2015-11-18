var Express = require('express');
var app = Express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Converter = require("csvtojson").Converter;
var fs = require('fs');
var path = require('path');

app.use(Express.static(path.resolve(__dirname + '/..')));

app.get('/', function(req,res){
  res.sendFile(path.resolve('../node_index.html'));
});

fs.watch(__dirname + "/queue.csv", function(event, filename) {
  var csvConverter = new Converter({});
  //end_parsed will be emitted once parsing finished
  csvConverter.on("end_parsed",function(csv){
    var queue = [];
    for(var i = 0; i < csv.length; i++) {
      queue.push(csv[i].file);
    }

    io.emit('queue', queue);
  });

  fs.createReadStream(__dirname + "/queue.csv").pipe(csvConverter);    
});

http.listen(3000, function(){
  console.log(Date.now());
  console.log('listening on *:3000');
});
