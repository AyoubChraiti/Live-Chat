import { ReactNode } from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-valo-dark-bg-secondary border-2 border-valo-red shadow-[0_0_30px_rgba(255,70,85,0.3)] max-w-md w-full animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b-2 border-valo-dark-border">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-valo-red">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-valo-red transition-colors p-1"
          >
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
