const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const botName = "CodesEra";

let rooms = {};
io.on("connection", (socket) => {

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} joined`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    if(!rooms[user.room]){
      rooms[user.room] = {
        codeData: '',
        inputData: '',
        outputData: '',
        langData: '',
        filenameData: ''
      }
    }
    socket.emit('getInstances', rooms[user.room]);
  });

  socket.on('sendInstance', (data) => {
    const room = data.room;
    const element = data.element;
    const instance = data.instance;
    if(!rooms[room]){
      rooms[room] = {};
    }
    rooms[room][element] = instance;
    console.log(rooms);
    socket.to(room).emit('getInstances', rooms[room]);
  });


  // socket.emit('getcode', codeData);
  // socket.on('sendcode', (codeText) => {
  //   console.log(codeText);
  //   codeData = codeText;
  //   socket.broadcast.emit('getcode', codeData);
  // });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} left`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});