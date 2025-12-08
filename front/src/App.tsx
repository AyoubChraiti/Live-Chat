import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth/Auth';
import { Chat } from './components/Chat/Chat';
import { Landing } from './components/Landing/Landing';
import { AIChat } from './components/AIChat/AIChat';
import './spotify-theme.css';

const AppContent = () => {
  const { currentUser, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderColor: 'var(--spotify-green)',
              borderTopColor: 'transparent'
            }}
          />
          <p 
            className="uppercase tracking-wider font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentUser ? <Chat /> : showAuth ? <Auth onBack={() => setShowAuth(false)} /> : <Landing onGetStarted={() => setShowAuth(true)} />}
      {currentUser && <AIChat />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
