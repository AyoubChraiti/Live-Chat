import { useState } from 'react';
import { Button } from '../ui/Button';
import { MessageSquare, Zap, Shield, Users } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing = ({ onGetStarted }: LandingProps) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Real-time',
      description: 'Lightning-fast message delivery with WebSocket technology for instant communication',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure',
      description: 'End-to-end encryption keeps your conversations private and protected',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Global',
      description: 'Connect with anyone, anywhere in the world, in real-time',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Responsive',
      description: 'Clean, modern UI that works seamlessly across all devices',
    },
  ];

  return (
    <div className="min-h-screen bg-valo-dark-bg text-white overflow-hidden flex flex-col">
      {/* Navigation Bar */}
      <nav className="relative z-20 border-b border-valo-dark-border/50 bg-valo-dark-bg/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-valo-red" />
            <span className="text-xl font-bold">Live Chat</span>
          </div>
          <Button
            onClick={onGetStarted}
            variant="primary"
            className="px-6 py-2 text-sm font-semibold"
          >
            Register / Login
          </Button>
        </div>
      </nav>

      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-valo-red/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center space-y-12">
          
          {/* Logo */}
          <div className="space-y-4">
            <MessageSquare className="w-12 h-12 text-valo-red mx-auto drop-shadow-[0_0_15px_rgba(255,70,85,0.6)]" />
            <h1 className="text-2xl font-bold text-white max-w-md mx-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Connect instantly. Chat freely. Experience real-time.
            </h1>
          </div>

          {/* Features - Inline Pills */}
          <div className="relative flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
                  group relative px-4 py-2 border rounded-full cursor-pointer flex-1 min-w-[140px]
                  ${activeFeature === index 
                    ? 'border-valo-red bg-valo-red/10' 
                    : 'border-valo-dark-border hover:border-valo-red/50'
                  }
                `}
                style={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: activeFeature === index ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className={`transition-all duration-400`}
                    style={{
                      color: activeFeature === index ? '#FF4655' : '#9CA3AF',
                      transform: activeFeature === index ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span 
                    className="text-sm font-medium uppercase tracking-wide"
                    style={{
                      transition: 'color 0.4s ease',
                      color: activeFeature === index ? '#FFFFFF' : '#9CA3AF',
                    }}
                  >
                    {feature.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Description */}
          <div className="min-h-[60px] flex items-center justify-center">
            <p className="text-sm text-gray-400 max-w-sm transition-opacity duration-300">
              {features[activeFeature].description}
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button
              onClick={onGetStarted}
              variant="primary"
              className="px-8 py-3 uppercase tracking-wide text-sm font-semibold"
            >
              Get Started
            </Button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-valo-dark-border/50 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            &copy; 2025 Live Chat
          </p>
        </div>
      </footer>
    </div>
  );
};
