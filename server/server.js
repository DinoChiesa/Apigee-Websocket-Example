// Copyright © 2022-2024 Google LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/* jshint esversion:9, node:true, strict:implied */
/* global process, console, Buffer, require */

const WebSocket = require("ws"),
  express = require("express"),
  app = express(),
  util = require("util"),
  os = require("os"),
  version = "20240716-1618",
  consoleTimestamp = require("console-stamp"),
  dateformat = require("dateformat"),
  port = process.env.PORT || 5950;

const fromTerminal = () =>
  os.hostname().endsWith(".internal") || os.hostname().startsWith("cs-");

const time = () => dateformat(new Date(), "isoDateTime");

if (fromTerminal()) {
  consoleTimestamp(console, {
    format: ":date(yyyy/mm/dd HH:MM:ss.l) :label"
  });
}

const logWrite = function (_a) {
  console.log(
    util.format.apply(null, Array.prototype.slice.call(arguments, 0))
  );
};

const wsServer = new WebSocket.Server({
  noServer: true
});

wsServer.on("connection", (ws) => {
  ws.on("message", (msg) => {
    logWrite("RECEIVED " + msg.toString());
    // send to each client that is ready
    const responseMessage = `${time()} - response to ${msg.toString()}`;
    wsServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(responseMessage);
      }
    });
  });
  ws.on("pong", function () {
    logWrite(`ws pong`);
  });
  ws.on("close", function () {
    // do anything necessary on close, here.
    logWrite(`ws close/disconnect`);
  });
});

const handleUpgrade = (request, socket, head) => {
  // handling the upgrade event
  logWrite(`ws upgrade request`);

  // if you want to conditionally reject the upgrade request, can do so here:
  // if(Math.random() > 0.5){
  //   return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii")     //proper connection close in case of rejection
  // }

  // emit connection when request accepted
  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    wsServer.emit("connection", ws, request);
  });
};

// start the http server using express
const httpServer = app.listen(port, () => {
  logWrite(`ws example service version ${version}`);
  logWrite(`listening on port ${httpServer.address().port}`);
});

httpServer.on("upgrade", handleUpgrade);
