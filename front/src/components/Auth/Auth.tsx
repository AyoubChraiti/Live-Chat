import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
        setError('');
        alert('Registration successful! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-valo-dark-bg dark:bg-valo-dark-bg relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-valo-red/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-valo-blue/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold uppercase tracking-wider text-valo-red mb-2 drop-shadow-[0_0_10px_rgba(255,70,85,0.5)]">
            VALORANT
          </h1>
          <p className="text-2xl font-semibold uppercase tracking-wide text-valo-blue">
            Live Chat
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-valo-dark-bg-secondary border-2 border-valo-dark-border p-8 shadow-valo">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6">
            {isLogin ? 'Sign In' : 'Register'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              disabled={isLoading}
            >
              {isLogin ? 'Create Account' : 'Back to Login'}
            </Button>
          </form>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-valo-red rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-valo-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-valo-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};
