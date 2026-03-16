export default function Header() {
  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-6 min-h-20">
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

      <div className="flex-1" />
    </header>
  );
}
