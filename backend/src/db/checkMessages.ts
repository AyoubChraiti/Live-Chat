// tester file that prints messages from the database ..

import { getMessages } from '../services/chat.service';

(async () => {
  const messages = await getMessages();
  console.log('Stored messages:', messages);
})();
