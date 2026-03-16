export default function Header() {
  return (
    <header className="navbar bg-base-100 border-b border-base-200 px-6 min-h-20">
      {/* Left — spacer */}
      <div className="flex-1" />

      {/* Center — search bar */}
      <div className="flex-none w-96">
        <label className="input input-bordered flex items-center gap-2 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.71 20.29 18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z" />
          </svg>
          <input type="search" placeholder="Type something to search" className="grow" />
        </label>
      </div>

      {/* Right — user avatar */}
      <div className="flex-1 flex justify-end">
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
