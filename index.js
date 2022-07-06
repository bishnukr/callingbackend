const express = require("express");
const app = express();
const path = require('path');
const http = require("http").Server(app);
const io = require("socket.io")(http);

//To holding users information 
const socketsStatus = {};

const staticPath = path.join(__dirname,'..public');

//enable user access to public folder 
app.set('view engine', 'hbs')
//app.use(express.static(staticPath));
app.get("", (req, res) =>{
  res.render('index')
})


io.on("connection", function (socket) {
  const socketId = socket.id;
  socketsStatus[socket.id] = {};


  console.log("connect");

  socket.on("voice", function (data) {

    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

    for (const id in socketsStatus) {

      if (id != socketId && !socketsStatus[id].mute && socketsStatus[id].online)
        socket.broadcast.to(id).emit("send", newData);
    }

  });

  socket.on("userInformation", function (data) {
    socketsStatus[socketId] = data;

    io.sockets.emit("usersUpdate",socketsStatus);
  });


  socket.on("disconnect", function () {
    delete socketsStatus[socketId];
  });

});

http.listen(4500, () => {
  console.log("the app is run in port 4500!");
});