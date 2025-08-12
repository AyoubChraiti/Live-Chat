// THIS is juuust a testr file ...

// test-ws.ts
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => { // send a basic message ..
  ws.send(JSON.stringify({ sender: 'ayoub', content: 'test message' }));
});

ws.on('message', (msg) => { // print received messages ..
  console.log('Received:', msg.toString());
});
