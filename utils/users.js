const users = [];

// Join user to chat
// function userJoin(id, username, room, userimage) {
//   const user = { id, username, room, userimage};

//   users.push(user);
//   console.log(users);
//   return user;
// }
function userJoin(id, username, room) {
  //console.log("userjoin func: ", userimage);
  const user = { id, username, room };
  //console.log('userJoin:', user); // log the user object to check the value of the userimage property
  //console.log('userimage: ', userimage);
  users.push(user);
  //console.log('users:', users); // log the entire users array to check if the user object is added correctly

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
