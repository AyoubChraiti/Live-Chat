import { initChatUI } from './components/ChatBox.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = initChatUI();
