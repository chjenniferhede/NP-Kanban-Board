type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
    >
      <div
        className="modal-content bg-(--color-bg-app) border border-base-300 rounded-lg shadow-lg p-4 w-56 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium">Delete this task?</p>
        <p className="text-xs text-base-content/50">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-error btn-sm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
