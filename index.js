require('dotenv').config();
const path = require("path");
const http = require("http");
const express = require("express");
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const cid = process.env.GOOGLE_CLIENT_ID;
const csec = process.env.GOOGLE_CLIENT_SECRET;
const bodyParser = require('body-parser');
const crypto = require('crypto');
const secret_key = crypto.randomBytes(64).toString('hex');
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
app.set('views', path.join(__dirname, 'public'));

const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./temp');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Connect to MongoDB
let mongodb_uri = process.env.MONGODB_URI;
mongoose.connect(mongodb_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define User model
const UserSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  imageUrl: String
});
const User = mongoose.model('User', UserSchema);
// Configure Passport.js
passport.use(new GoogleStrategy({
  clientID: cid,
  clientSecret: csec,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = await new User({
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      imageUrl: profile.photos[0].value
    }).save();
    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

app.use(session({
  name: 'normal-session',
  secret: secret_key,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session({
  name: 'passport-session',
  resave: false,
  saveUninitialized: true
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const isLoggedIn = (req, res, next) => {
  console.log("From login mw: ", req.session);
  const roomId = req.session.roomId;
  if (req.user) {
      console.log("From login mw: ", req.session);
      if(roomId && roomId != undefined){  
        return res.redirect('/join/' + roomId);
      }
      return res.redirect('/join');
  }
  next();
};

const isNotLoggedIn = (req, res, next) => {
    const room_id = req.params.roomId;
    console.log("param read", req.params.roomId)
    if(room_id){
      req.session.roomId = room_id;
      localStorage.setItem('roomId', room_id);
      console.log(room_id, req.session.roomId);
    }
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
  };

// Home route
app.get('/', (req, res) => {
  localStorage.removeItem('roomId');
  res.render('index');
});

app.get('/login', isLoggedIn, function(req, res) {
  res.render('login');
});

// Google OAuth2 route
app.get('/auth/google', cors(), passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth2 callback route
app.get('/auth/google/callback', cors(), passport.authenticate('google', {
  failureRedirect: '/login'
}), function(req, res) {
  const roomId = localStorage.getItem('roomId');
  if(roomId == "undefined") roomId = undefined;
  console.log("After auth from locStorage: ", roomId);
  console.log("After auth before session: ", req.session.roomId);
  req.session.roomId = roomId;
  const set_room_id = req.session.roomId;
  console.log("After auth after session setting: ", req.session.roomId);
  localStorage.removeItem('roomId');
  console.log('Removed LocStorage:', localStorage.getItem('roomId'));
  if(set_room_id && set_room_id != undefined){
    res.redirect('/join/' + set_room_id);
  } else {
    res.redirect('/join');
  }
  
});

app.get('/join/:roomId?', isNotLoggedIn, function(req, res) {
  roomId = req.session.roomId;
  localStorage.removeItem('roomId');
  console.log("After middleware: ", roomId, req.session.roomId);
  // if(roomId)
  //   console.log(roomId);
  // Get user data from Google Sign-In
  const userData = {
    name: req.user.displayName,
    imageUrl: req.user.imageUrl,
    email: req.user.email
  };
  const newImgUrl = userData.imageUrl.replace("=s96-c", "=s200-c");
  console.log(userData)
  // Render the dashboard page with the user data
  res.render('join', { userData: userData, roomId: roomId || null, userImg: newImgUrl});
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      // Handle error
      return;
    }
    // User has been logged out
    res.redirect('/login');
  });
});

app.post('/workspace', function(req, res){
  if(!req.body.hasOwnProperty('room')){
    res.redirect('/join');
  }
  const room = req.body.room;
  console.log('post wsp', room);
  const userData = {
    name: req.user.displayName,
    imageUrl: req.user.imageUrl,
    email: req.user.email
  };

  const newImgUrl = userData.imageUrl.replace("=s96-c", "=s200-c");
  console.log(userData.imageUrl, newImgUrl);
  req.session.roomId = room;
  res.render('workspace', {useremail: userData.email, username: userData.name, userimage: userData.imageUrl, room: room, userData: userData, userImg: newImgUrl});
});

// app.get('/leave', (req, res) => {
//   const room = req.session.roomId;
//   const confirmation = confirm('Are you sure you want to redirect?');
//   if (confirmation) {
//     res.redirect('/join/${room}');
//   } else {
//     // do something else if the user clicks "Cancel"
//   }
// });


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const botName = "CodesEra";

let rooms = {};
io.on("connection", (socket) => {

  socket.on("joinRoom", ({username, room}) => {
    console.log(`User ${username} joined room ${room} with email`);
    const user = userJoin(socket.id, username, room);
    // socket.join(user.room);
    if(!rooms[user.room]){
      rooms[user.room] = {
        host: '',
        participants: [],
        codeData: '',
        inputData: '',
        outputData: '',
        langData: '',
        filenameData: '',
        allowOthers: true
      }
    }
    if(rooms[user.room].participants.length == 0){
      rooms[user.room].host = user.username;
    }
    rooms[user.room].participants.push(user.username);
    // console.log(user);
    // console.log(user.userimage);
    // rooms[room].participants.push(username);
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

    // if(!rooms[user.room]){
    //   rooms[user.room] = {
    //     codeData: '',
    //     inputData: '',
    //     outputData: '',
    //     langData: '',
    //     filenameData: ''
    //   }
    // }
    
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