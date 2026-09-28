import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
};

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-ink-300" />
      </div>
      <h3 className="text-base font-serif font-semibold text-ink-700 mb-1">{title}</h3>
      <p className="text-sm text-ink-400 max-w-xs mb-5">{message}</p>
      {action}
    </div>
  );
}
