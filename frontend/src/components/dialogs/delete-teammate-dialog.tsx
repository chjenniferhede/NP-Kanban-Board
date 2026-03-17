type Props = {
  memberName: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteTeammateDialog({ memberName, deleting, onConfirm, onCancel }: Props) {
  return (
    <dialog id="delete-teammate-modal" className="modal backdrop:bg-black/60">
      <div className="modal-box flex flex-col gap-4">
        <h3 className="font-bold text-lg">Remove teammate</h3>
        <p className="text-sm text-base-content/70">
          Are you sure you want to remove <span className="font-semibold text-base-content">{memberName}</span> from the team?
        </p>
        <div className="modal-action mt-0">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-error" onClick={onConfirm} disabled={deleting}>
            {deleting ? <span className="loading loading-spinner loading-xs" /> : "Remove"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  );
}
