import { User } from '../../types';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';

interface ChatHeaderProps {
  selectedUser: User | null;
  onViewProfile: () => void;
  onInviteToGame: () => void;
  onBlockUser: () => void;
  isBlocked: boolean;
}

export const ChatHeader = ({
  selectedUser,
  onViewProfile,
  onInviteToGame,
  onBlockUser,
  isBlocked,
}: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b-2 border-valo-dark-border bg-valo-dark-bg-secondary flex items-center justify-between">
      <div className="flex items-center gap-3">
        {selectedUser ? (
          <>
            <div className="relative">
              <div className="w-12 h-12 bg-valo-dark-bg-tertiary border-2 border-valo-red rounded-lg flex items-center justify-center">
                <Icons.User className="w-6 h-6 text-valo-red" />
              </div>
              {selectedUser.status === 'online' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-valo-green border-2 border-valo-dark-bg-secondary rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                {selectedUser.username}
              </h3>
              <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Icons.Online className={`w-2 h-2 ${selectedUser.status === 'online' ? 'text-valo-green' : 'text-gray-500'}`} />
                {selectedUser.status || 'offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-valo-dark-bg-tertiary border-2 border-valo-dark-border rounded-lg flex items-center justify-center">
              <Icons.Message className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider text-gray-500">
              Select an agent
            </h3>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="icon"
            onClick={onViewProfile}
            title="View Profile"
          >
            <Icons.User className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant="icon"
            onClick={onInviteToGame}
            title="Invite to Game"
            disabled={isBlocked}
          >
            <Icons.Game className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant="icon"
            onClick={onBlockUser}
            title={isBlocked ? 'Unblock User' : 'Block User'}
            className={isBlocked ? 'border-valo-green text-valo-green hover:border-valo-green-dark' : 'border-red-500 text-red-500 hover:border-red-600'}
          >
            {isBlocked ? <Icons.Unblock className="w-5 h-5" /> : <Icons.Block className="w-5 h-5" />}
          </Button>
        </div>
      )}
    </div>
  );
};
