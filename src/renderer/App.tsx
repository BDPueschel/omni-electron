export function App() {
  return (
    <div className="w-full h-full bg-omni-bg text-omni-text font-sans">
      <div className="p-3 border-b border-omni-separator">
        <input
          type="text"
          placeholder="Search..."
          autoFocus
          className="w-full bg-transparent border-none outline-none text-lg text-omni-text placeholder:text-white/30"
        />
      </div>
    </div>
  );
}
