const chatBtn = document.getElementById('chat-btn');
const chatCloseBtn = document.getElementById('close-chat');
const chatContainer = document.getElementById('chat-container');
const wbBtn = document.getElementById('wb-btn');
const wbContainer = document.getElementById('whiteboard');
const wbWrapper = document.getElementById('wb-canvas-wrapper');
const csContainer = document.getElementById('codespace');

chatBtn.addEventListener("click", () => {
    chatContainer.classList.toggle('hidden');
    if(chatContainer.classList.contains('hidden')){
        wbWrapper.style.maxWidth = ((window.innerWidth) <= 860 ? '55rem' : '60rem');
    } else {
        wbWrapper.style.maxWidth = '40rem';
    }
});

chatCloseBtn.addEventListener("click", () => {
    chatContainer.classList.add('hidden');
    wbWrapper.style.maxWidth = ((window.innerWidth) <= 860 ? '55rem' : '60rem');
});

wbBtn.addEventListener("click", () => {
    wbContainer.classList.toggle('hidden');
    csContainer.classList.toggle('hidden');
});

const muteBtn = document.getElementById('mute-btn');
const deafenBtn = document.getElementById('deafen-btn');

muteBtn.addEventListener("click", () => {
    muteBtn.classList.toggle('bg-red-600');
    muteBtn.classList.toggle('bg-green-600');

    const state = muteBtn.innerHTML;
    const mute_state = `<i class="bi bi-mic-mute-fill"></i>`;
    const unmute_state = `<i class="bi bi-mic-fill"></i>`;

    if(state == mute_state){
        muteBtn.innerHTML = unmute_state;
    } else {
        muteBtn.innerHTML = mute_state;
    }
});

deafenBtn.addEventListener("click", () => {
    deafenBtn.classList.toggle('bg-red-600');
    deafenBtn.classList.toggle('bg-green-600');
});

function getLocalStream() {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then((stream) => {
        window.localStream = stream; // A
        window.localAudio.srcObject = stream; // B
        window.localAudio.autoplay = true; // C
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          // User blocked the audio permission
          muteBtn.disabled = true;
          console.log('User blocked audio permission');
        } else {
            muteBtn.disabled = false;
        }
      });
  }

const permit = document.getElementById('permission');
const permitBtn = document.getElementById('host-access-btn');
const closePermissionBtn = document.getElementById('close-permission');

permitBtn.addEventListener("click", () => {
    permit.classList.toggle('hidden');
});
closePermissionBtn.addEventListener("click", () => {
    permit.classList.add('hidden');
});