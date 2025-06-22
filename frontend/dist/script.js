"use strict";
const app = document.getElementById('Chat-app');
const title = document.createElement('h2');
title.textContent = "💬 Pong Chat";
title.className = "text-2xl font-bold text-center text-red-600 mb-4";
const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 mb-3";
const usernameInput = document.createElement('input');
usernameInput.placeholder = "Your Username";
usernameInput.className = inputClass;
usernameInput.id = "username";
const recipientInput = document.createElement('input');
recipientInput.placeholder = "Recipient Username";
recipientInput.className = inputClass;
recipientInput.id = "recipient";
const messagesBox = document.createElement('div');
messagesBox.id = "messages";
messagesBox.className = "h-64 overflow-y-auto bg-gray-100 border border-gray-300 rounded-lg p-4 text-sm mb-3";
const messageInput = document.createElement('input');
messageInput.placeholder = "Type a message...";
messageInput.className = inputClass;
messageInput.id = "message";
const sendBtn = document.createElement('button');
sendBtn.textContent = "Send";
sendBtn.className = "w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition duration-200";
app.append(title, usernameInput, recipientInput, messagesBox, messageInput, sendBtn);
let socket = null;
function setupSocket(user) {
    console.log("Connecting to:", `ws://localhost:3000/ws?user=${user}`);
    socket = new WebSocket(`ws://localhost:3000/ws?user=${user}`);
    socket.onopen = () => console.log("✅ Connected");
    socket.onclose = () => console.log("❌ Disconnected");
    socket.onmessage = (event) => {
        console.log("Received message:", event.data);
        const msg = JSON.parse(event.data);
        const div = document.createElement('div');
        div.innerHTML = `<span class="font-semibold text-red-600">[${msg.from}]</span>: ${msg.content}`;
        messagesBox.appendChild(div);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    };
}
// Send button logic with waiting for open socket
sendBtn.onclick = (e) => {
    e.preventDefault();
    const user = usernameInput.value.trim();
    const to = recipientInput.value.trim();
    const content = messageInput.value.trim();
    if (!user || !to || !content) {
        alert("Please fill in all fields.");
        return;
    }
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            setupSocket(user);
        }
        // Wait for socket to open before sending
        const interval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("Sending message:", { to, content });
                socket.send(JSON.stringify({ to, content }));
                messageInput.value = '';
                clearInterval(interval);
            }
        }, 100);
        return;
    }
    console.log("Sending message:", { to, content });
    socket.send(JSON.stringify({ to, content }));
    messageInput.value = '';
};
