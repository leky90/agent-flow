interface DeleteConfirmProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
