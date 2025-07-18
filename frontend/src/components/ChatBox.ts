import { sendMessage, onMessage } from '../ws';

export function initChatUI(): string {
  setTimeout(() => setupEvents(), 0); // wait until DOM is ready
  return `
    <div class="flex flex-col h-full">
      <div id="messages" class="flex-1 overflow-y-auto mb-4 p-2 border h-64 rounded bg-gray-50"></div>
      <form id="chat-form" class="flex gap-2">
        <input id="sender" type="text" placeholder="Your name" class="border px-2 py-1 rounded w-1/3" />
        <input id="content" type="text" placeholder="Say something..." class="border px-2 py-1 rounded flex-1" />
        <button class="bg-blue-500 text-white px-4 py-1 rounded">Send</button>
      </form>
    </div>
  `;
}

function setupEvents() {
  const form = document.querySelector<HTMLFormElement>('#chat-form')!;
  const contentInput = document.querySelector<HTMLInputElement>('#content')!;
  const senderInput = document.querySelector<HTMLInputElement>('#sender')!;
  const messagesBox = document.querySelector<HTMLDivElement>('#messages')!;

  form.onsubmit = (e) => {
    e.preventDefault();
    if (!contentInput.value || !senderInput.value)
      return;

    sendMessage(senderInput.value, contentInput.value);
    contentInput.value = '';
  };

  onMessage((msg) => {
    const div = document.createElement('div');
    div.className = 'text-sm my-1';
    div.innerText = `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.sender}: ${msg.content}`;
    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}
