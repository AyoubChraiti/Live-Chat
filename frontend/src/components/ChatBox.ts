import { sendMessage, onMessage } from '../ws';

export function initChatUI(): string {
  setTimeout(() => setupEvents(), 0);
  return `
    <div class="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden font-inter antialiased">
      
      <!-- Sidebar -->
      <aside class="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ChatSpace
            </h1>
          </div>
          <div class="text-sm text-gray-400">Choose a channel</div>
        </div>
        
        <div class="p-4">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Channels</div>
          <div id="room-list" class="space-y-1">
            <button data-room="general" class="room-btn active w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-3 group">
              <div class="w-2 h-2 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors"></div>
              <span class="font-medium"># General</span>
              <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              </div>
            </button>
            <button data-room="tech" class="room-btn w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-3 group">
              <div class="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-400 transition-colors"></div>
              <span class="font-medium"># Tech</span>
              <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              </div>
            </button>
            <button data-room="gaming" class="room-btn w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-3 group">
              <div class="w-2 h-2 rounded-full bg-orange-500 group-hover:bg-orange-400 transition-colors"></div>
              <span class="font-medium"># Gaming</span>
              <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              </div>
            </button>
            <button data-room="random" class="room-btn w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-3 group">
              <div class="w-2 h-2 rounded-full bg-pink-500 group-hover:bg-pink-400 transition-colors"></div>
              <span class="font-medium"># Random</span>
              <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              </div>
            </button>
          </div>
        </div>

        <!-- User Status -->
        <div class="mt-auto p-4 border-t border-white/10">
          <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
              <span id="user-avatar">?</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate" id="user-display">Anonymous</div>
              <div class="text-xs text-gray-400">Online</div>
            </div>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <div class="flex flex-col flex-1 relative">
        
        <!-- Chat Header -->
        <header class="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6 flex justify-between items-center sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h2 class="font-bold text-xl text-white" id="room-name"># General</h2>
              <div class="text-sm text-gray-400">
                <span id="member-count">3 members</span> • <span id="status-text">Active now</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <input
              id="sender"
              type="text"
              placeholder="Your display name"
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 min-w-0 w-48"
              autocomplete="off"
            />
            <button class="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Messages Container -->
        <div class="flex-1 relative">
          <div id="messages" class="flex flex-col p-6 space-y-4 overflow-y-auto h-full scroll-smooth">
            <!-- Welcome Message -->
            <div class="flex justify-center">
              <div class="bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-3 text-center max-w-md">
                <div class="text-gray-300 text-sm">
                  Welcome to <span class="font-semibold text-purple-400">#General</span>! 
                  Start chatting with the community.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Scroll to Bottom Button -->
          <button id="scroll-bottom" class="absolute bottom-24 right-6 hidden bg-purple-600/90 backdrop-blur-sm hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </button>
        </div>

        <!-- Typing Indicator -->
        <div id="typing-indicator" class="hidden px-6 py-2">
          <div class="flex items-center gap-2 text-gray-400 text-sm">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            </div>
            <span id="typing-users">Someone is typing...</span>
          </div>
        </div>

        <!-- Input Form -->
        <form id="chat-form" class="p-6 bg-black/20 backdrop-blur-xl border-t border-white/10 sticky bottom-0">
          <div class="flex items-end gap-4">
            <div class="flex-1 relative">
              <textarea
                id="content"
                placeholder="Type your message... (Shift + Enter for new line)"
                class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 pr-12 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none max-h-32 min-h-[3rem]"
                rows="1"
                autocomplete="off"
              ></textarea>
              <button
                type="button"
                id="emoji-btn"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
            <button
              type="submit"
              id="send-btn"
              class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-2xl px-6 py-4 font-semibold transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 min-w-0"
              disabled
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              <span class="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function loadHistory(messagesBox: HTMLDivElement, senderValue: string, room: string) {
  try {
    const res = await fetch(`http://localhost:3000/messages?room=${encodeURIComponent(room)}`);
    const history = await res.json();

    // Clear messages but keep the welcome message
    const welcomeMsg = messagesBox.querySelector('.bg-white\\/5');
    messagesBox.innerHTML = '';
    if (welcomeMsg) {
      messagesBox.appendChild(welcomeMsg);
    }

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
  const isMine = msg.sender === currentSender;
  
  div.className = `flex ${isMine ? 'justify-end' : 'justify-start'} animate-fadeIn`;
  
  const messageContent = document.createElement('div');
  messageContent.className = `max-w-[75%] group relative ${isMine ? 'order-1' : 'order-2'}`;
  
  const bubble = document.createElement('div');
  bubble.className = `px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-200 ${
    isMine 
      ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border-purple-500/30 rounded-br-md' 
      : 'bg-white/10 text-gray-100 border-white/10 rounded-bl-md hover:bg-white/15'
  }`;

  // Format timestamp
  const timestamp = new Date(msg.timestamp);
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  bubble.innerHTML = `
    <div class="flex items-start gap-3">
      ${!isMine ? `<div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        ${msg.sender.charAt(0).toUpperCase()}
      </div>` : ''}
      <div class="flex-1 min-w-0">
        ${!isMine ? `<div class="text-xs font-medium text-gray-300 mb-1">${msg.sender}</div>` : ''}
        <div class="break-words text-sm leading-relaxed">${msg.content}</div>
        <div class="text-xs mt-2 ${isMine ? 'text-purple-200' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity">
          ${timeString}
        </div>
      </div>
    </div>
  `;

  messageContent.appendChild(bubble);
  div.appendChild(messageContent);
  messagesBox.appendChild(div);
  
  // Add scroll animation
  setTimeout(() => {
    div.classList.add('animate-slideUp');
  }, 50);
}

function autoResize(textarea: HTMLTextAreaElement) {
  textarea.style.height = '3rem';
  textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
}

function updateUserDisplay(name: string) {
  const avatar = document.querySelector('#user-avatar');
  const display = document.querySelector('#user-display');
  
  if (avatar && display && name.trim()) {
    avatar.textContent = name.charAt(0).toUpperCase();
    display.textContent = name;
  }
}

function setupEvents() {
  const form = document.querySelector<HTMLFormElement>('#chat-form')!;
  const contentInput = document.querySelector<HTMLTextAreaElement>('#content')!;
  const senderInput = document.querySelector<HTMLInputElement>('#sender')!;
  const messagesBox = document.querySelector<HTMLDivElement>('#messages')!;
  const roomButtons = document.querySelectorAll<HTMLButtonElement>('.room-btn');
  const roomNameDisplay = document.querySelector<HTMLDivElement>('#room-name')!;
  const sendBtn = document.querySelector<HTMLButtonElement>('#send-btn')!;
  const scrollBottomBtn = document.querySelector<HTMLButtonElement>('#scroll-bottom')!;

  let currentRoom = 'general';
  let isAtBottom = true;

  // Auto-resize textarea
  contentInput.addEventListener('input', () => {
    autoResize(contentInput);
    
    // Enable/disable send button
    const hasContent = contentInput.value.trim().length > 0;
    const hasSender = senderInput.value.trim().length > 0;
    sendBtn.disabled = !(hasContent && hasSender);
  });

  // Update user display when name changes
  senderInput.addEventListener('input', () => {
    updateUserDisplay(senderInput.value);
    const hasContent = contentInput.value.trim().length > 0;
    const hasSender = senderInput.value.trim().length > 0;
    sendBtn.disabled = !(hasContent && hasSender);
  });

  // Scroll detection
  messagesBox.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = messagesBox;
    isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isAtBottom) {
      scrollBottomBtn.classList.add('hidden');
    } else {
      scrollBottomBtn.classList.remove('hidden');
    }
  });

  // Scroll to bottom
  scrollBottomBtn.addEventListener('click', () => {
    messagesBox.scrollTo({ top: messagesBox.scrollHeight, behavior: 'smooth' });
  });

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
    updateUserDisplay(senderInput.value);
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const sender = senderInput.value.trim();
    const content = contentInput.value.trim();

    if (!sender || !content) return;

    // Uncomment when backend is ready
    // sendMessage(sender, content, currentRoom);
    
    // Simulate message for demo
    const mockMessage = {
      sender,
      content,
      room: currentRoom,
      timestamp: new Date().toISOString()
    };
    appendMessage(messagesBox, mockMessage, sender);
    
    contentInput.value = '';
    autoResize(contentInput);
    sendBtn.disabled = true;
    contentInput.focus();
    
    if (isAtBottom) {
      setTimeout(() => {
        messagesBox.scrollTop = messagesBox.scrollHeight;
      }, 50);
    }
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
      // Remove active class from all buttons
      roomButtons.forEach(b => b.classList.remove('active', 'bg-white/10', 'text-white'));
      
      // Add active class to clicked button
      btn.classList.add('active', 'bg-white/10', 'text-white');
      
      currentRoom = btn.dataset.room!;
      roomNameDisplay.textContent = `# ${currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)}`;
      
      // Update welcome message
      const welcomeMsg = messagesBox.querySelector('.bg-white\\/5 .text-gray-300');
      if (welcomeMsg) {
        welcomeMsg.innerHTML = `Welcome to <span class="font-semibold text-purple-400">#${currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)}</span>! Start chatting with the community.`;
      }
      
      tryLoadHistory();
    });
  });

  // Real-time new messages
  onMessage((msg) => {
    if (msg.room === currentRoom) {
      const sender = senderInput.value.trim();
      appendMessage(messagesBox, msg, sender);
      
      if (isAtBottom) {
        setTimeout(() => {
          messagesBox.scrollTop = messagesBox.scrollHeight;
        }, 50);
      }
    }
  });

  // Focus on content input by default
  contentInput.focus();
}