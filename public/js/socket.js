const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
}); 

let url = "https://codesera.onrender.com"

const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 1800000,
    transports: ["websocket"],
};

var socket = io(url, options);

function sendInstance(room, element, instance){
  socket.emit('sendInstance', {
    room: room,
    element: element,
    instance: instance
  });
}

function updateInstance(room, data){
  let editors = {codeEditor: "code", inputField: "input", outputField: "output"};
  if(["codeEditor", "inputField", "outputField"].includes(data.element)){
    const editor = ace.edit(editors[data.element]);
    editor.setValue(data.instance);
    editor.clearSelection();
    console.log(editors[data.element]);
    // data.element.setValue(data.instance);
  } else {
    document.getElementById(data.element).value = data.instance;
  }
}

socket.emit('joinRoom', { username, room });
socket.emit('getInstance', room); //need to check

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('getInstances', function(instances){
  codeEditor.setValue(instances.codeData);
  inputField.setValue(instances.inputData);
  outputField.setValue(instances.outputData);
  document.getElementById('lang').value = instances.langData;
  document.getElementById('filename').value = instances.filenameData;
});

const codeArea = document.getElementById('code');
codeArea.addEventListener("keyup", function(){
    const instance = codeEditor.getValue();
    sendInstance(room, 'codeData', instance);
});

const inputArea = document.getElementById('input');
inputArea.addEventListener("keyup", function(){
    const instance = inputField.getValue();
    sendInstance(room, 'inputData', instance);
});

const outputArea = document.getElementById('output');
outputArea.addEventListener("change", function(){
    const instance = outputField.getValue();
    sendInstance(room, 'outputData', instance);
});

const languageArea = document.getElementById('lang');
languageArea.addEventListener("change", function(){
    const instance = languageArea.value;
    sendInstance(room, 'langData', instance);
});

const filenameArea = document.getElementById('filename');
filenameArea.addEventListener("change", function(){
    const instance = filenameArea.value;
    sendInstance(room, 'filenameData', instance);
});

socket.on('getInstances', function(instances){
  updateInstance(room, {element: 'codeEditor', instance: instances.codeData});
  updateInstance(room, {element: 'inputField', instance: instances.inputData});
  updateInstance(room, {element: 'outputField', instance: instances.outputData});
  updateInstance(room, {element: 'lang', instance: instances.langData});
  updateInstance(room, {element: 'filename', instance: instances.filenameData});
});



socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// socket.on('getcode', (codeData) => {
//   codeEditor.setValue(codeData);
//   codeEditor.clearSelection();
// });
// const codeArea = document.getElementById('code');
// codeArea.addEventListener("keyup", function(){
//     const codeText = codeEditor.getValue();
//     socket.emit('sendcode', codeText);
// });

function firstName(name){
  let fName = name.split(" ");
  return fName[0];
}

function outputMessage(message) {
  const div = document.createElement('div');

  if(message.username == "CodesEra"){
    console.log(message.text)
    div.classList.add('chat-notification', 'text-center', 'my-2', 'text-sm', 'font-normal');
    const words = message.text.split(" ");
    const lastWord = words[words.length - 1];
    const type = lastWord == "joined" ? "green":"red";
    div.innerHTML = `
      <div class="bot-message p-1 text-${type}-400">
          <span class="font-medium">${message.text}</span>
      </div>
    `;
    let user_entry_notification = message.text + ' the room';
    createAlert(user_entry_notification, type);
  } else {
      div.classList.add('message', 'w-full', 'my-2');
      div.innerHTML = `
        <div class="p-2">
            <div class="flex justify-start pt-1 pb-3 font-medium items-end text-sm">
                <div id="username" class="">${message.username == username ? "You" : firstName(message.username)}</div>
                <div id="time" class="text-gray-500 text-xs pl-2 text-right">${message.time}</div>
            </div>
            <div class="">${message.text}</div>
        </div>
      `;
  }
  document.querySelector('.chat-messages').appendChild(div);
}

function createAlert(joining_message, type) {
  const alertContainer = document.getElementById("alert-container");
  const alertElement = document.createElement("div");
  alertElement.innerHTML = joining_message;
  alertElement.className = `relative text-sm font-normal text-center top-0 right-0 m-4 bg-${type}-600 text-white border border-${type}-600 rounded px-6 py-3`;

  setTimeout(function() {
    alertElement.classList.add("disappearing-alert");
    setTimeout(function() {
      alertElement.remove();
    }, 500);
  }, 3000);

  alertElement.addEventListener("click", function() {
    alertElement.classList.add("disappearing-alert");
    setTimeout(function() {
      alertElement.remove();
    }, 500);
  });
  alertContainer.appendChild(alertElement);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function createAvatar(name){
    const initialName = name.split(" ");
    let avatarName = initialName[0][0] + [(initialName.length == 1) ? initialName[0][1] : initialName[1][0]];
    return avatarName;
}

function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const div = document.createElement('div');
    div.classList.add('user', 'flex', 'w-full', 'text-white', 'text-sm', 'my-4');
    div.innerHTML = `
        <div class="user_badge  flex justify-center items-center bg-blue-700 w-8 h-8 py-auto text-center font-medium uppercase rounded">` + createAvatar(user.username) + `</div>
        <div class="user_name flex items-center pl-2 text-` + ((user.username !== username) ? "white" : "blue-400") + ` font-medium truncate">${user.username}</div>
    `;
    userList.appendChild(div);
  });
}

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the room?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});