const ws = new WebSocket('ws://localhost:3000');

export function sendMessage(sender: string, content: string) {
  ws.send(JSON.stringify({ sender, content }));
}

export function onMessage(callback: (data: any) => void) {
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    callback(msg);
  };
}
