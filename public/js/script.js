const chatBtn = document.getElementById('chat-btn');
const chatCloseBtn = document.getElementById('close-chat');
const chatContainer = document.getElementById('chat-container');

chatBtn.addEventListener("click", () => {
    chatContainer.classList.toggle('hidden');
});

chatCloseBtn.addEventListener("click", () => {
    chatContainer.classList.add('hidden');
});