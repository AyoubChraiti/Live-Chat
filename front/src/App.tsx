import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth/Auth';
import { Chat } from './components/Chat/Chat';

const AppContent = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-valo-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-valo-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-valo-blue uppercase tracking-wider font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return currentUser ? <Chat /> : <Auth />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
