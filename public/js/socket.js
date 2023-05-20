const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// const { username, room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// }); 

let url = "https://codesera.onrender.com"
// let url = "http://localhost:3000"

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
    // console.log(editors[data.element]);
    // data.element.setValue(data.instance);
  } else {
    document.getElementById(data.element).value = data.instance;
  }
}
const dp_img = userimage;
// console.log(username, room, userimage);
// console.log(typeof(userimage));
socket.emit('joinRoom', {username, room});
socket.emit('getInstance', room); //need to check

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('getInstances', function(instances){
  codeEditor.setValue(instances.codeData);
  codeEditor.clearSelection();
  inputField.setValue(instances.inputData);
  inputField.clearSelection();
  outputField.setValue(instances.outputData);
  outputField.clearSelection();
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

const checkbox = document.getElementById('allowContributionCheckbox');

checkbox.addEventListener('change', function() {
  // const instance = languageArea.value;
  sendInstance(room, 'allowOthers', this.checked);
  // console.log("state: ", this.checked);
  if (this.checked) {
    // console.log("Checkbox is checked..");
  } else {
    // console.log("Checkbox is not checked..");
  }
});

socket.on('getInstances', function(instances){
  updateInstance(room, {element: 'codeEditor', instance: instances.codeData});
  updateInstance(room, {element: 'inputField', instance: instances.inputData});
  updateInstance(room, {element: 'outputField', instance: instances.outputData});
  updateInstance(room, {element: 'lang', instance: instances.langData});
  updateInstance(room, {element: 'filename', instance: instances.filenameData});



  var tempUser = document.getElementsByClassName('temp-user')[0].innerText;
  if(tempUser === instances.host){
    // console.log("admin: ", instances.host);
    document.getElementById('settingBtn').classList.remove('hidden');
  } else {
    // console.log("non-admin: ", instances.host);
    let editor = ace.edit('code');
    let ipeditor = ace.edit('input');
    let langfield = document.getElementById('lang');
    let filename = document.getElementById('filename');
    if(instances.allowOthers == false){
      // console.log('Allow users disabled');
      editor.setOptions({readOnly : true});
      ipeditor.setOptions({readOnly : true});
      langfield.disabled = true;
      filename.readOnly = true;
    } else {
      // console.log('Allow users enabled');
      editor.setOptions({readOnly : false});
      ipeditor.setOptions({readOnly : false});
      langfield.disabled = false;
      filename.readOnly = false;
    }
  }
  //updateInstance(room, {element: 'filename', instance: instances.filenameData});
});



socket.on('message', (message) => {
  // console.log(message);
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
    // console.log(message.text)
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
        <!-- <img src="${user.userimage}" alt="${user.username}" class="user_avatar rounded-full" style="width: 25px; height: 25px; position: relative;"> -->
        <div class="user_badge  flex justify-center items-center bg-blue-700 w-8 h-8 py-auto text-center font-medium uppercase rounded-full">` + createAvatar(user.username) + `</div>
        <div class="user_name flex items-center pl-2 text-` + ((user.username !== username) ? "white" : "blue-400") + ((user.username !== username) ? " " : " temp-user") + ` font-medium" style="flex-wrap: wrap;"><p style="max-width: 175px; flex-shrink: 0; width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.username}</p></div>
    `;
    userList.appendChild(div);
  });
}

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the room?');
  if (leaveRoom) {
    // window.location = '/join/<%= room %>' ;
    // console.log(room);
    window.location.href = '/join/' + room;
    // console.log("Redirected to /join/", room);
  } else {
  }
});

document.getElementById("copy-room-link").addEventListener("click", function() {
  const url = "https://codesera.onrender.com/join/" + room;
  navigator.clipboard.writeText(url).then(function() {
    const alertDiv = document.createElement("div");
    alertDiv.textContent = "Room Link Copied!";
    // alertDiv.classList.add("alert_event", "bg-blue-600");
    alertDiv.className = `alert_event text-sm font-normal text-center m-4 bg-blue-600 text-white border border-blue-600 rounded px-6 py-3`;
    // Append the alert to the DOM
    document.body.appendChild(alertDiv);

    // Remove the alert after 1 second
    setTimeout(function() {
      alertDiv.classList.add("disappearing-alert");
      // alertDiv.remove();
    }, 1000);
  }, function() {
    alert("Failed to copy room link to clipboard.");
  });
});