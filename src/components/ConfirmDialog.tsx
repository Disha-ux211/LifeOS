import Modal from './Modal';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
};

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-ink-600 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="btn-primary bg-blush-500 hover:bg-blush-600"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
