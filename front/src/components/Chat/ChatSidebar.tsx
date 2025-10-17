import { User } from '../../types';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

interface ChatSidebarProps {
  users: User[];
  selectedUser: User | null;
  currentUsername: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

export const ChatSidebar = ({
  users,
  selectedUser,
  currentUsername,
  connectionStatus,
  onSelectUser,
  onLogout,
}: ChatSidebarProps) => {
  const statusColors = {
    connected: 'bg-valo-green',
    connecting: 'bg-valo-gold',
    disconnected: 'bg-red-500',
  };

  const statusLabels = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
  };

  return (
    <div className="w-72 bg-valo-dark-bg border-r border-valo-dark-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-valo-dark-border/50">
        <div className="flex items-center justify-between mb-4">
          <Icons.Message className="w-6 h-6 text-valo-red" />
          <h2 className="text-xl font-bold text-white">
            Live Chat
          </h2>
          <Button
            onClick={onLogout}
            variant="icon"
            size="sm"
            title="Logout"
            className="hover:border-red-500/50 hover:text-red-500 border-valo-dark-border/50 px-3 py-2 flex items-center gap-1.5"
          >
            <Icons.Logout className="w-4 h-4" />
            <span className="text-xs font-medium">Logout</span>
          </Button>
        </div>
        
        {/* Current User */}
        <div className="flex items-center gap-3 p-3 bg-valo-dark-bg-secondary border border-valo-dark-border/50">
          <div className="w-8 h-8 bg-valo-red/10 border border-valo-red/30 flex items-center justify-center">
            <Icons.User className="w-4 h-4 text-valo-red" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{currentUsername}</div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColors[connectionStatus]}`} />
              <span className="text-gray-500">{statusLabels[connectionStatus]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {users.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-valo-dark-bg-secondary border border-valo-dark-border/50 flex items-center justify-center mx-auto mb-3">
              <Icons.User className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">No users online</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3
                  border transition-all duration-200
                  ${
                    selectedUser?.id === user.id
                      ? 'bg-valo-red/5 border-valo-red/50'
                      : 'bg-valo-dark-bg-secondary border-valo-dark-border/50 hover:border-valo-red/30 hover:bg-valo-dark-bg-secondary/50'
                  }
                `}
              >
                <div className="relative">
                  <div className={`w-8 h-8 flex items-center justify-center border ${
                    selectedUser?.id === user.id ? 'bg-valo-red/10 border-valo-red/30' : 'bg-valo-dark-bg border-valo-dark-border/50'
                  }`}>
                    <Icons.User className={`w-4 h-4 ${selectedUser?.id === user.id ? 'text-valo-red' : 'text-gray-400'}`} />
                  </div>
                  {user.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-valo-green border-2 border-valo-dark-bg rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`text-sm font-medium truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-300'}`}>
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Icons.Online className={`w-1.5 h-1.5 ${user.status === 'online' ? 'text-valo-green' : 'text-gray-600'}`} />
                    {user.status || 'offline'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
