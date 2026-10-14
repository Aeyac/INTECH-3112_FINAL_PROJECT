import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Yes, delete it',
    processing = false,
}) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="pt-1 text-sm text-slate-600">{message}</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={processing}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={processing}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
