import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const { data } = await axios.post(`${API_BASE_URL}/api/refresh`, {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (username: string, password: string) =>
    apiClient.post('/api/register', { username, password }),
  
  login: (username: string, password: string) =>
    apiClient.post('/api/login', { username, password }),
  
  logout: () =>
    apiClient.post('/api/logout'),
  
  verify: () =>
    apiClient.get('/api/verify'),
  
  refresh: (refreshToken: string) =>
    apiClient.post('/api/refresh', { refreshToken }),
};

// User API
export const userAPI = {
  getProfile: (id: number) =>
    apiClient.get(`/api/users/${id}`),
  
  updateProfile: (id: number, bio: string, avatar: string) =>
    apiClient.put(`/api/users/${id}`, { bio, avatar }),
  
  getAllUsers: (userId?: number) =>
    apiClient.get('/api/users', { params: { userId } }),
  
  blockUser: (userId: number, targetId: number) =>
    apiClient.post(`/api/users/${userId}/block/${targetId}`),
  
  unblockUser: (userId: number, targetId: number) =>
    apiClient.post(`/api/users/${userId}/unblock/${targetId}`),
  
  getBlockedUsers: (userId: number) =>
    apiClient.get(`/api/blocked/${userId}`),
};

// Message API
export const messageAPI = {
  getConversation: (userId: number, otherUserId: number) =>
    apiClient.get(`/api/messages/${userId}/${otherUserId}`),
};

// Game API
export const gameAPI = {
  sendInvite: (senderId: number, receiverId: number) =>
    apiClient.post('/api/game-invite', { senderId, receiverId }),
  
  respondToInvite: (inviteId: number, status: string) =>
    apiClient.post('/api/game-invite/respond', { inviteId, status }),
  
  createTournament: (name: string, participants: number[]) =>
    apiClient.post('/api/tournament', { name, participants }),
  
  notifyTournamentMatch: (id: number, player1Id: number, player2Id: number, round: number) =>
    apiClient.post(`/api/tournament/${id}/notify`, { player1Id, player2Id, round }),
};

// AI API
export const aiAPI = {
  chat: (message: string, conversationHistory?: any[]) =>
    apiClient.post('/api/ai/chat', { message, conversationHistory }),
  
  getSuggestions: () =>
    apiClient.get('/api/ai/suggestions'),
};

export default apiClient;
