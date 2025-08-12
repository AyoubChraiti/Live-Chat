import { sendMessage, onMessage } from '../ws';

export function initChatUI(): string {
  setTimeout(() => setupEvents(), 0);
  return `
    <div class="flex flex-col h-full max-h-[600px] w-full max-w-md bg-white rounded shadow-lg overflow-hidden">
      <header class="bg-blue-600 text-white p-4 font-semibold text-lg">
        Live Chat
      </header>
      <div id="messages" class="flex flex-col overflow-y-auto p-4 space-y-2 bg-gray-50 flex-1"></div>
      <form id="chat-form" class="flex p-4 border-t border-gray-200 gap-2 bg-white">
        <input
          id="sender"
          type="text"
          placeholder="Your name"
          class="border border-gray-300 rounded px-3 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autocomplete="off"
        />
        <input
          id="content"
          type="text"
          placeholder="Say something..."
          class="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autocomplete="off"
        />
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 transition"
        >
          Send
        </button>
      </form>
    </div>
  `;
}

async function loadHistory(messagesBox: HTMLDivElement, senderValue: string) {
  try {
    const res = await fetch('http://localhost:3000/messages');
    const history = await res.json();

    for (const msg of history) {
      appendMessage(messagesBox, msg, senderValue);
    }

    messagesBox.scrollTop = messagesBox.scrollHeight;
  } catch (err) {
    console.error('Failed to load message history', err);
  }
}

function appendMessage(messagesBox: HTMLDivElement, msg: any, currentSender: string) {
  const div = document.createElement('div');
  div.className = 'text-sm max-w-[80%] p-2 rounded break-words';

  const isMine = msg.sender === currentSender;

  if (isMine) {
    div.classList.add('bg-blue-600', 'text-white', 'self-end');
  } else {
    div.classList.add('bg-gray-200', 'text-gray-800', 'self-start');
  }

  div.innerText = `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.sender}: ${msg.content}`;
  messagesBox.appendChild(div);
}

function setupEvents() {
  const form = document.querySelector<HTMLFormElement>('#chat-form')!;
  const contentInput = document.querySelector<HTMLInputElement>('#content')!;
  const senderInput = document.querySelector<HTMLInputElement>('#sender')!;
  const messagesBox = document.querySelector<HTMLDivElement>('#messages')!;

  // load chat history once sender is typed or on page load if sender input has value
  // wait for sender input change or blur
  function tryLoadHistory() {
    if (senderInput.value.trim()) {
      loadHistory(messagesBox, senderInput.value.trim());
      senderInput.removeEventListener('blur', tryLoadHistory);
      senderInput.removeEventListener('change', tryLoadHistory);
    }
  }
  senderInput.addEventListener('blur', tryLoadHistory);
  senderInput.addEventListener('change', tryLoadHistory);
  // loding immediately if sender already has a value
  if (senderInput.value.trim()) {
    loadHistory(messagesBox, senderInput.value.trim());
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const sender = senderInput.value.trim();
    const content = contentInput.value.trim();

    if (!sender || !content)
        return;

    sendMessage(sender, content);
    contentInput.value = '';
    contentInput.focus();
  };

  contentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  onMessage((msg) => {
    const sender = senderInput.value.trim();
    appendMessage(messagesBox, msg, sender);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}
