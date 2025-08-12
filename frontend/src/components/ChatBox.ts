import { sendMessage, onMessage } from '../ws';

export function initChatUI(): string {
  setTimeout(() => setupEvents(), 0);
  return `
    <div class="flex h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
      
      <!-- Sidebar -->
      <aside class="w-72 bg-black border-r border-gray-800 flex flex-col">
        <div class="p-5 font-bold text-2xl border-b border-gray-800 text-purple-400">Channels</div>
        <div id="room-list" class="flex-1 overflow-y-auto">
          <button data-room="general" class="room-btn w-full text-left px-5 py-3 text-gray-300 hover:bg-gray-800 hover:text-purple-400 focus:bg-gray-800 focus:text-purple-400 transition-colors duration-200"># General</button>
          <button data-room="tech" class="room-btn w-full text-left px-5 py-3 text-gray-300 hover:bg-gray-800 hover:text-purple-400 focus:bg-gray-800 focus:text-purple-400 transition-colors duration-200"># Tech</button>
          <button data-room="gaming" class="room-btn w-full text-left px-5 py-3 text-gray-300 hover:bg-gray-800 hover:text-purple-400 focus:bg-gray-800 focus:text-purple-400 transition-colors duration-200"># Gaming</button>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <div class="flex flex-col flex-1">
        
        <!-- Chat Header -->
        <header class="bg-black border-b border-gray-800 p-5 flex justify-between items-center sticky top-0 z-10">
          <div class="font-semibold text-xl text-purple-400" id="room-name"># General</div>
          <input
            id="sender"
            type="text"
            placeholder="Your name"
            class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            autocomplete="off"
          />
        </header>

        <!-- Messages -->
        <div id="messages" class="flex flex-col flex-1 p-5 space-y-4 overflow-y-auto bg-gray-900"></div>

        <!-- Input Form -->
        <form id="chat-form" class="flex items-center p-5 bg-black border-t border-gray-800 gap-3 sticky bottom-0">
          <input
            id="content"
            type="text"
            placeholder="Type a message..."
            class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            autocomplete="off"
          />
          <button
            type="submit"
            class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2 font-semibold transition transform hover:scale-105 duration-200"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  `;
}

async function loadHistory(messagesBox: HTMLDivElement, senderValue: string, room: string) {
  try {
    const res = await fetch(`http://localhost:3000/messages?room=${encodeURIComponent(room)}`);
    const history = await res.json();

    messagesBox.innerHTML = '';
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
  div.className = 'max-w-[70%] px-4 py-3 rounded-xl shadow text-sm break-words transition-all duration-200';

  const isMine = msg.sender === currentSender;

  if (isMine) {
    div.classList.add('bg-purple-600', 'text-white', 'self-end', 'rounded-br-none');
  } else {
    div.classList.add('bg-gray-800', 'text-gray-200', 'self-start', 'rounded-bl-none', 'border', 'border-gray-700');
  }

  div.innerHTML = `
    <span class="text-xs opacity-70 block mb-1 text-gray-300">${msg.sender} • ${new Date(msg.timestamp).toLocaleTimeString()}</span>
    <span>${msg.content}</span>
  `;

  messagesBox.appendChild(div);
}

function setupEvents() {
  const form = document.querySelector<HTMLFormElement>('#chat-form')!;
  const contentInput = document.querySelector<HTMLInputElement>('#content')!;
  const senderInput = document.querySelector<HTMLInputElement>('#sender')!;
  const messagesBox = document.querySelector<HTMLDivElement>('#messages')!;
  const roomButtons = document.querySelectorAll<HTMLButtonElement>('.room-btn');
  const roomNameDisplay = document.querySelector<HTMLDivElement>('#room-name')!;

  let currentRoom = 'general';

  function tryLoadHistory() {
    const sender = senderInput.value.trim();
    if (sender) {
      loadHistory(messagesBox, sender, currentRoom);
    }
  }

  senderInput.addEventListener('blur', tryLoadHistory);
  senderInput.addEventListener('change', tryLoadHistory);

  if (senderInput.value.trim()) {
    tryLoadHistory();
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const sender = senderInput.value.trim();
    const content = contentInput.value.trim();

    if (!sender || !content) return;

    // sendMessage(sender, content, currentRoom);
    contentInput.value = '';
    contentInput.focus();
  };

  contentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // Room switching
  roomButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentRoom = btn.dataset.room!;
      roomNameDisplay.textContent = `# ${currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)}`;
      tryLoadHistory();
    });
  });

  // Real-time new messages
  onMessage((msg) => {
    if (msg.room === currentRoom) {
      const sender = senderInput.value.trim();
      appendMessage(messagesBox, msg, sender);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  });
}