const joinRoom = document.getElementById('join-room');
let userName, roomName;
joinRoom.addEventListener("submit", () => {
  userName = document.getElementById('user-id').value;
  roomName = document.getElementById('room-id').value;
});

module.exports = {
    userName,
    roomName
};