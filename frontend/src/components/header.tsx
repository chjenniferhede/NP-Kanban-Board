export default function Header() {
  return (
    <header className="navbar bg-base-100 border-b border-base-200 px-4">
      {/* Left — empty, reserved for logo or nav */}
      <div className="flex-1" />

      {/* Right — user avatar */}
      <div className="flex-none">
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-9">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
