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
    <div className="w-80 bg-valo-dark-bg-secondary border-r-2 border-valo-dark-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-2 border-valo-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-valo-red flex items-center gap-2">
            <Icons.Message className="w-5 h-5" />
            Agents
          </h2>
          <Button
            onClick={onLogout}
            variant="icon"
            size="sm"
            title="Logout"
            className="hover:border-red-500 hover:text-red-500"
          >
            <Icons.Logout className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Current User */}
        <div className="flex items-center gap-3 p-3 bg-valo-dark-bg-tertiary border-2 border-valo-dark-border rounded">
          <div className="w-10 h-10 bg-valo-red/20 border-2 border-valo-red rounded-lg flex items-center justify-center">
            <Icons.User className="w-5 h-5 text-valo-red" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{currentUsername}</div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]} animate-pulse`} />
              <span className="text-gray-400">{statusLabels[connectionStatus]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {users.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-valo-dark-bg-tertiary border-2 border-valo-dark-border rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icons.User className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No agents online</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3 rounded
                  border-2 transition-all duration-200
                  ${
                    selectedUser?.id === user.id
                      ? 'bg-valo-red/10 border-valo-red shadow-[0_0_10px_rgba(255,70,85,0.2)]'
                      : 'bg-valo-dark-bg-tertiary border-valo-dark-border hover:border-valo-red/50 hover:bg-valo-dark-bg'
                  }
                `}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
                    selectedUser?.id === user.id ? 'bg-valo-red/20 border-valo-red' : 'bg-valo-dark-bg border-valo-dark-border'
                  }`}>
                    <Icons.User className={`w-5 h-5 ${selectedUser?.id === user.id ? 'text-valo-red' : 'text-gray-400'}`} />
                  </div>
                  {user.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-valo-green border-2 border-valo-dark-bg-secondary rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-semibold truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-300'}`}>
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-500 uppercase flex items-center gap-1">
                    <Icons.Online className={`w-2 h-2 ${user.status === 'online' ? 'text-valo-green' : 'text-gray-600'}`} />
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
