let currentUser = null;
let selectedUser = null;
let ws = null;
let typingTimeout = null;
let reconnectTimeout = null;
let isConnecting = false;

const API_URL = 'http://localhost:3000/api';
const WS_URL = 'ws://localhost:3000/ws';

function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.className = `connection-status ${status}`;
        switch (status) {
            case 'connected':
                statusElement.textContent = '● Connected';
                break;
            case 'connecting':
                statusElement.textContent = '● Connecting...';
                break;
            case 'disconnected':
                statusElement.textContent = '● Disconnected';
                break;
        }
    }
}

function checkExistingSession() {
    const storedUser = localStorage.getItem('chatApp_currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log('🔄 Restoring session for user:', currentUser);
            
            // Validate the session by checking if user still exists
            validateSession();
            
        } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('chatApp_currentUser');
        }
    }
    return false;
}

async function validateSession() {
    try {
        // Check if the user still exists on the server
        const response = await fetch(`${API_URL}/users/${currentUser.id}`);
        if (response.ok) {
            console.log('✅ Session validated, user exists');
            
            // Update UI to logged-in state
            document.getElementById('currentUsername').textContent = currentUser.username;
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('sidebar').classList.remove('hidden');
            document.getElementById('chatArea').classList.remove('hidden');
            
            // Connect WebSocket and load users
            connectWebSocket();
            loadUsers();
        } else {
            console.log('❌ Session invalid, user no longer exists');
            localStorage.removeItem('chatApp_currentUser');
            currentUser = null;
        }
    } catch (error) {
        console.error('Failed to validate session:', error);
        localStorage.removeItem('chatApp_currentUser');
        currentUser = null;
    }
}

// Check for existing session when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded, checking for existing session...');
    checkExistingSession();
});

async function register() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('loginPassword').value = '';
        } else {
            const error = await response.json();
            alert(error.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Network error. Please check your connection.');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            currentUser = await response.json();
            console.log('Login successful:', currentUser);
            
            // Save user data to localStorage for session persistence
            localStorage.setItem('chatApp_currentUser', JSON.stringify(currentUser));
            
            // Update UI
            document.getElementById('currentUsername').textContent = currentUser.username;
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('sidebar').classList.remove('hidden');
            document.getElementById('chatArea').classList.remove('hidden');
            
            // Connect WebSocket and load users
            connectWebSocket();
            loadUsers();
        } else {
            const error = await response.json();
            alert(error.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Network error. Please check your connection.');
    }
}

function connectWebSocket() {
    if (isConnecting) return;
    
    // Check if we have a user (either from login or restored session)
    if (!currentUser) {
        console.log('❌ No current user, cannot connect WebSocket');
        return;
    }
    
    isConnecting = true;
    updateConnectionStatus('connecting');
    console.log('🔗 Connecting to WebSocket for user:', currentUser.username);
    
    // Close existing connection if any
    if (ws) {
        ws.close();
    }
    
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('WebSocket connected');
        isConnecting = false;
        updateConnectionStatus('connected');
        clearTimeout(reconnectTimeout);
        
        // Authenticate with the server
        ws.send(JSON.stringify({ type: 'auth', userId: currentUser.id }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('🔔 WebSocket message received:', data);
        console.log('📝 Current user ID:', currentUser?.id);
        console.log('👤 Selected user ID:', selectedUser?.id);

        if (data.type === 'message') {
            console.log('📨 Processing incoming message...');
            
            // This is a message for us from another user
            if (data.receiver_id === currentUser.id && data.sender_id !== currentUser.id) {
                // Check if this message is for the current conversation
                if (selectedUser && data.sender_id === selectedUser.id) {
                    displayMessage(data, 'received');
                } else {
                    // Message from an unselected user
                    console.log('📨 Received message from unselected user:', data.senderUsername);
                    updateUserListForNewMessage(data.sender_id, data.senderUsername);
                }
            }
        } else if (data.type === 'message_confirmed') {
            console.log('✅ Message confirmation received for tempId:', data.tempId);
            // This confirms our sent message, so we replace the temporary one
            if (data.tempId && data.sender_id === currentUser.id) {
                removeTemporaryMessage(data.tempId);
                if (selectedUser && data.receiver_id === selectedUser.id) {
                    displayMessage(data, 'sent');
                }
            }
        } else if (data.type === 'typing') {
            if (selectedUser && data.senderId === selectedUser.id) {
                showTypingIndicator(data.isTyping);
            }
        } else if (data.type === 'error') {
            console.error('❌ WebSocket error:', data.message);
            alert(data.message);
        } else if (data.type === 'game_invitation') {
            showNotification(
                'Game Invitation',
                `${data.senderUsername} invited you to play Pong!`,
                [
                    { text: 'Accept', class: 'accept-btn', action: () => respondToInvite(data.inviteId, 'accepted') },
                    { text: 'Decline', class: 'decline-btn', action: () => respondToInvite(data.inviteId, 'declined') }
                ]
            );
        } else if (data.type === 'game_invitation_response') {
            showNotification(
                'Game Response',
                `Your game invitation was ${data.status}`,
                []
            );
        } else if (data.type === 'tournament_match') {
            showNotification(
                'Tournament Match',
                `Your next match in ${data.tournamentName} (Round ${data.round}) is ready!`,
                [
                    { text: 'OK', class: 'accept-btn', action: () => hideNotification() }
                ]
            );
        } else {
            console.log('🤷 Unknown message type:', data.type);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting = false;
        updateConnectionStatus('disconnected');
    };

    ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        isConnecting = false;
        updateConnectionStatus('disconnected');
        
        // Only reconnect if user is still logged in
        if (currentUser && !event.wasClean) {
            console.log('Attempting to reconnect in 3 seconds...');
            reconnectTimeout = setTimeout(() => {
                connectWebSocket();
            }, 3000);
        }
    };
}

async function loadUsers() {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();

    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    users.forEach(user => {
        if (user.id !== currentUser.id) {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.onclick = () => selectUser(user);
            userItem.innerHTML = `
                <div class="user-status ${user.status}"></div>
                <div>${user.username}</div>
            `;
            userList.appendChild(userItem);
        }
    });
}

async function selectUser(user) {
    selectedUser = user;
    document.getElementById('chatUsername').textContent = user.username;

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
        // Remove new message indicator when selecting this user
        const indicator = item.querySelector('.new-message-indicator');
        if (indicator && JSON.parse(item.dataset.user).id === user.id) {
            indicator.remove();
        }
    });
    event.target.closest('.user-item').classList.add('active');

    // Update block button status
    await updateBlockButtonStatus();

    const response = await fetch(`${API_URL}/messages/${currentUser.id}/${user.id}`);
    const messages = await response.json();

    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    messages.forEach(msg => {
        displayMessage({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            senderUsername: msg.sender_username || (msg.sender_id === currentUser.id ? currentUser.username : selectedUser.username),
            createdAt: msg.created_at
        }, msg.sender_id === currentUser.id ? 'sent' : 'received');
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateUserListForNewMessage(senderId, senderUsername) {
    // Find the user item in the list and add a visual indicator for new messages
    const userItems = document.querySelectorAll('.user-item');
    userItems.forEach(item => {
        const userData = JSON.parse(item.dataset.user);
        if (userData.id === senderId) {
            // Add a visual indicator for new messages
            if (!item.querySelector('.new-message-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'new-message-indicator';
                indicator.textContent = '●';
                indicator.style.cssText = 'color: #ff4444; font-weight: bold; margin-left: auto;';
                item.appendChild(indicator);
            }
        }
    });
}

function displayMessage(message, type) {
    console.log('🖼️ DisplayMessage called');
    console.log('📨 Message data:', message);
    console.log('📋 Message type:', type);

    const chatHistory = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.dataset.messageId = message.id;

    // Add temporary class for optimistic messages
    if (message.isTemporary) {
        messageDiv.classList.add('temporary');
    }

    const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (type === 'sent') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${escapeHtml(message.content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-sender">${escapeHtml(message.senderUsername)}</div>
                <div class="message-text">${escapeHtml(message.content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    }

    chatHistory.appendChild(messageDiv);
    
    // Auto-scroll to bottom like Discord
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    console.log('✅ Message displayed successfully');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    console.log('🚀 SendMessage called');
    console.log('📝 Message content:', content);
    console.log('👤 Selected user:', selectedUser);
    console.log('🔗 WebSocket state:', ws?.readyState);

    if (!content) {
        console.log('❌ No content to send');
        return;
    }
    
    if (!selectedUser) {
        console.log('❌ No user selected');
        return;
    }

    // Check if WebSocket is connected
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log('❌ WebSocket not connected, state:', ws?.readyState);
        alert('Connection lost. Reconnecting...');
        connectWebSocket();
        return;
    }

    // Create message with temporary ID for optimistic UI
    const tempMessage = {
        id: 'temp_' + Date.now(),
        content: content,
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        senderUsername: currentUser.username,
        createdAt: new Date().toISOString(),
        isTemporary: true
    };

    // Immediately display message (optimistic UI like Discord)
    console.log('📱 Displaying message optimistically');
    displayMessage(tempMessage, 'sent');

    // Clear input immediately
    input.value = '';

    // Prepare message data for server
    const messageData = {
        type: 'message',
        receiverId: selectedUser.id,
        content: content,
        tempId: tempMessage.id // Send temp ID so we can replace it later
    };

    // Send the message to server
    try {
        console.log('📤 Sending message to server:', messageData);
        ws.send(JSON.stringify(messageData));
        console.log('✅ Message sent to server');
    } catch (error) {
        console.error('❌ Failed to send message:', error);
        // Remove the optimistic message on error
        removeTemporaryMessage(tempMessage.id);
        alert('Failed to send message. Please try again.');
        input.value = content; // Restore the message text
    }
}

function removeTemporaryMessage(tempId) {
    const messageElements = document.querySelectorAll('.message');
    messageElements.forEach(msgEl => {
        if (msgEl.dataset.messageId === tempId) {
            msgEl.remove();
        }
    });
}

function handleTyping(event) {
    if (event.key === 'Enter') {
        sendMessage();
        return;
    }

    if (!selectedUser || !ws || ws.readyState !== WebSocket.OPEN) return;

    try {
        ws.send(JSON.stringify({
            type: 'typing',
            receiverId: selectedUser.id,
            isTyping: true
        }));

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'typing',
                    receiverId: selectedUser.id,
                    isTyping: false
                }));
            }
        }, 1000);
    } catch (error) {
        console.error('Failed to send typing indicator:', error);
    }
}

function showTypingIndicator(isTyping) {
    const indicator = document.getElementById('typingIndicator');
    if (isTyping) {
        indicator.textContent = `${selectedUser.username} is typing...`;
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

async function viewProfile() {
    if (!selectedUser) return;

    const response = await fetch(`${API_URL}/users/${selectedUser.id}`);
    const profile = await response.json();

    const content = document.getElementById('profileContent');
    content.innerHTML = `
        <div class="profile-info">
            <label>Username</label>
            <p>${profile.username}</p>
        </div>
        <div class="profile-info">
            <label>Status</label>
            <p>${profile.status}</p>
        </div>
        <div class="profile-info">
            <label>Bio</label>
            <p>${profile.bio || 'No bio available'}</p>
        </div>
        <div class="profile-info">
            <label>Member Since</label>
            <p>${new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
    `;

    document.getElementById('profileModal').classList.add('active');
}

function closeModal() {
    document.getElementById('profileModal').classList.remove('active');
}

async function inviteToGame() {
    if (!selectedUser) return;

    const response = await fetch(`${API_URL}/game-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            senderId: currentUser.id,
            receiverId: selectedUser.id
        })
    });

    if (response.ok) {
        showNotification('Invitation Sent', `Game invitation sent to ${selectedUser.username}`, []);
    }
}

async function respondToInvite(inviteId, status) {
    await fetch(`${API_URL}/game-invite/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, status })
    });

    hideNotification();
}

async function updateBlockButtonStatus() {
    if (!selectedUser) return;

    try {
        const response = await fetch(`${API_URL}/blocked/${currentUser.id}`);
        const blockedUsers = await response.json();
        
        const isBlocked = blockedUsers.some(user => user.id === selectedUser.id);
        const blockBtn = document.getElementById('blockBtn');
        
        if (isBlocked) {
            blockBtn.innerHTML = '✅ Unblock';
            blockBtn.title = 'Unblock User';
        } else {
            blockBtn.innerHTML = '🚫 Block';
            blockBtn.title = 'Block User';
        }
    } catch (error) {
        console.error('Failed to check block status:', error);
    }
}

async function toggleBlockUser() {
    if (!selectedUser) return;

    try {
        // Check current block status
        const response = await fetch(`${API_URL}/blocked/${currentUser.id}`);
        const blockedUsers = await response.json();
        const isBlocked = blockedUsers.some(user => user.id === selectedUser.id);

        let actionResponse;
        if (isBlocked) {
            // Unblock user
            actionResponse = await fetch(`${API_URL}/unblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blockerId: currentUser.id,
                    blockedId: selectedUser.id
                })
            });
            
            if (actionResponse.ok) {
                alert(`${selectedUser.username} has been unblocked`);
                await updateBlockButtonStatus();
            }
        } else {
            // Block user
            const confirmed = confirm(`Are you sure you want to block ${selectedUser.username}?`);
            if (!confirmed) return;

            actionResponse = await fetch(`${API_URL}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blockerId: currentUser.id,
                    blockedId: selectedUser.id
                })
            });

            if (actionResponse.ok) {
                alert(`${selectedUser.username} has been blocked`);
                await updateBlockButtonStatus();
            }
        }
    } catch (error) {
        console.error('Failed to toggle block status:', error);
        alert('Failed to update block status. Please try again.');
    }
}

function showNotification(header, body, actions) {
    const notification = document.getElementById('notification');
    document.getElementById('notificationHeader').textContent = header;
    document.getElementById('notificationBody').textContent = body;

    const actionsDiv = document.getElementById('notificationActions');
    actionsDiv.innerHTML = '';

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.textContent = action.text;
        btn.className = action.class;
        btn.onclick = action.action;
        actionsDiv.appendChild(btn);
    });

    notification.classList.add('active');

    if (actions.length === 0) {
        setTimeout(hideNotification, 3000);
    }
}

function hideNotification() {
    document.getElementById('notification').classList.remove('active');
}

function logout() {
    console.log('🚪 Logging out...');
    
    // Clear stored session data
    localStorage.removeItem('chatApp_currentUser');
    
    // Clear timeouts
    clearTimeout(reconnectTimeout);
    clearTimeout(typingTimeout);
    
    // Close WebSocket connection cleanly
    if (ws) {
        ws.close(1000, 'User logout'); // Clean close
        ws = null;
    }
    
    // Reset state
    currentUser = null;
    selectedUser = null;
    isConnecting = false;
    
    // Reset UI
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('chatArea').classList.add('hidden');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('messages').innerHTML = '';
    document.getElementById('userList').innerHTML = '';
    document.getElementById('chatUsername').textContent = 'Select a user to chat';
    
    // Reset connection status
    updateConnectionStatus('disconnected');
}