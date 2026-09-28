import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
};

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] bg-ink-900/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-cream-50 rounded-2xl border border-cream-200 shadow-hover animate-scale-in max-h-[82vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <h2 className="text-lg font-serif font-semibold text-ink-800">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 transition-colors p-1">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
