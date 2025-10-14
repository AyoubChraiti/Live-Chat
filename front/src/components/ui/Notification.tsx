import { NotificationAction } from '../../types';
import { Button } from './Button';
import { Icons } from './Icons';

interface NotificationProps {
  isVisible: boolean;
  title: string;
  message: string;
  actions?: NotificationAction[];
  type?: 'info' | 'success' | 'warning' | 'game';
}

export const Notification = ({ isVisible, title, message, actions, type = 'info' }: NotificationProps) => {
  if (!isVisible) return null;

  const typeStyles = {
    info: 'border-valo-blue',
    success: 'border-valo-green',
    warning: 'border-valo-gold',
    game: 'border-valo-purple',
  };

  const typeIcons = {
    info: <Icons.Message className="w-6 h-6 text-valo-blue" />,
    success: <Icons.Check className="w-6 h-6 text-valo-green" />,
    warning: <Icons.X className="w-6 h-6 text-valo-gold" />,
    game: <Icons.Game className="w-6 h-6 text-valo-purple" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-slide-in">
      <div className={`bg-valo-dark-bg-secondary border-2 ${typeStyles[type]} shadow-[0_0_20px_rgba(255,70,85,0.2)] p-4 rounded`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {typeIcons[type]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-300">
              {message}
            </p>
            {actions && actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.class.includes('accept') ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={action.action}
                  >
                    {action.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
