import { useEffect, useRef } from "react";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirm({ onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog ref={ref} className="modal backdrop:bg-black/60" onClose={onCancel}>
      <div className="modal-box flex flex-col gap-4">
        <h3 className="font-bold text-lg">Delete task</h3>
        <p className="text-sm text-base-content/70">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="modal-action mt-0">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-error" onClick={onConfirm}>Delete</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  );
}
