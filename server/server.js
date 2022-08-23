// server.js
// ------------------------------------------------------------------
//
/* jshint esversion:9, node:true, strict:implied */
/* global process, console, Buffer */

const WebSocket = require("ws"),
      express = require("express"),
      app = express(),
      util = require("util"),
      version = '20220823-1502',
      port = process.env.PORT || 5950;

const time = () => {
        let time = (new Date()).toString(),
            tstr = '[' + time.substr(11, 4) + '-' +
                 time.substr(4, 3) + '-' +
                 time.substr(8, 2) + ' ' +
                 time.substr(16, 8) + '] ';
        return tstr;
      };

const logWrite = function(a) {
        console.log(time() + util.format.apply(null, Array.prototype.slice.call(arguments, 0)));
      };

// regular http server using node express
const httpServer =
  app.listen(port, () => {
    logWrite(`ws example service version ${version}`);
    logWrite(`listening on port ${httpServer.address().port}`);
  });


const wsServer = new WebSocket.Server({
        noServer: true
      });

wsServer.on("connection", ws => {
  ws.on("message", msg => {
    logWrite('RECEIVED ' + msg.toString());
    // send to each client that is ready
    wsServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        let responseMessage = `${time()}${msg.toString()}`;
        client.send(responseMessage);
      }
    });
  });
  ws.on("pong", function(){
    logWrite(`ws pong`);
  });
  ws.on("close", function() {
    //do closing stuff here
    logWrite(`ws close/disconnect`);
  });
});

httpServer.on('upgrade', async function upgrade(request, socket, head) {
  // handling the upgrade event
  logWrite(`ws upgrade request`);

  // if you want to reject the connection, can do so here:
  // if(Math.random() > 0.5){
  //   return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii")     //proper connection close in case of rejection
  // }

  // emit connection when request accepted
  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    wsServer.emit('connection', ws, request);
  });
});
