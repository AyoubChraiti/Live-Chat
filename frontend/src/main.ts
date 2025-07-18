import { initChatUI } from './components/ChatBox';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = initChatUI();
