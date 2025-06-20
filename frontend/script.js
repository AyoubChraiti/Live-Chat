let socket = null

function setupWebSocket() {
  const username = document.getElementById('username').value.trim()
  if (!username) {
    alert("Enter your username first")
    return
  }

  socket = new WebSocket(`ws://localhost:3000/ws?user=${username}`)

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    const msgBox = document.getElementById('messages')
    const msg = `[${data.from}]: ${data.content}`
    msgBox.innerHTML += `<div>${msg}</div>`
  }

  socket.onopen = () => {
    console.log("Connected to server")
  }

  socket.onclose = () => {
    console.log("Disconnected from server")
  }
}

function sendMessage() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    setupWebSocket()
    setTimeout(sendMessage, 500) // try again shortly
    return
  }

  const to = document.getElementById('recipient').value.trim()
  const content = document.getElementById('message').value.trim()
  if (!to || !content) {
    alert("Enter recipient and message")
    return
  }

  socket.send(JSON.stringify({ to, content }))
  document.getElementById('message').value = ''
}
