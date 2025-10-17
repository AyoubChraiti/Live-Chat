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
    <div className="p-4 border-b border-valo-dark-border/50 bg-valo-dark-bg flex items-center justify-between">
      <div className="flex items-center gap-3">
        {selectedUser ? (
          <>
            <div className="relative">
              <div className="w-10 h-10 bg-valo-dark-bg-secondary border border-valo-red/30 flex items-center justify-center">
                <Icons.User className="w-5 h-5 text-valo-red" />
              </div>
              {selectedUser.status === 'online' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-valo-green border-2 border-valo-dark-bg rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {selectedUser.username}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Icons.Online className={`w-2 h-2 ${selectedUser.status === 'online' ? 'text-valo-green' : 'text-gray-500'}`} />
                {selectedUser.status || 'offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-valo-dark-bg-secondary border border-valo-dark-border/50 flex items-center justify-center">
              <Icons.Message className="w-5 h-5 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-500">
              Select a user
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
            className="border-valo-dark-border/50 hover:border-valo-red/50 px-3 py-2 flex items-center gap-1.5"
          >
            <Icons.User className="w-4 h-4" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
          <Button
            size="sm"
            variant="icon"
            onClick={onInviteToGame}
            title="Invite to Game"
            disabled={isBlocked}
            className="border-valo-dark-border/50 hover:border-valo-red/50 px-3 py-2 flex items-center gap-1.5"
          >
            <Icons.Game className="w-4 h-4" />
            <span className="text-xs font-medium">Invite</span>
          </Button>
          <Button
            size="sm"
            variant="icon"
            onClick={onBlockUser}
            title={isBlocked ? 'Unblock User' : 'Block User'}
            className={`px-3 py-2 flex items-center gap-1.5 ${isBlocked ? 'border-valo-green/50 text-valo-green hover:border-valo-green' : 'border-red-500/50 text-red-500 hover:border-red-500'}`}
          >
            {isBlocked ? <Icons.Unblock className="w-4 h-4" /> : <Icons.Block className="w-4 h-4" />}
            <span className="text-xs font-medium">{isBlocked ? 'Unblock' : 'Block'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
