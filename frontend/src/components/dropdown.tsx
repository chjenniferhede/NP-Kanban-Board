import { useEffect, useRef } from "react";

export type Option = { value: string; label: string; initials?: string; color?: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  buttonClassName?: string;
  menuClassName?: string;
};

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
      style={{ backgroundColor: color, width: 22, height: 22 }}
    >
      {initials}
    </span>
  );
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  buttonClassName = "",
  menuClassName = "",
}: Props) {
  const ref = useRef<HTMLDetailsElement>(null);
  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption?.label ?? label;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ref.current.removeAttribute("open");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function select(v: string) {
    onChange(v);
    ref.current?.removeAttribute("open");
  }

  return (
    <details ref={ref} className="dropdown w-full">
      <summary className={`flex items-center justify-between gap-2 cursor-pointer list-none ${buttonClassName}`}>
        <span className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.initials && selectedOption?.color && (
            <Avatar initials={selectedOption.initials} color={selectedOption.color} />
          )}
          <span className="truncate">{selectedLabel}</span>
        </span>
        <svg className="w-3 h-3 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <ul className={`dropdown-content menu bg-base-100 rounded-box shadow-lg border border-base-200 z-[200] p-1 ${menuClassName}`}>
        {options.map((o) => (
          <li key={o.value}>
            <a
              className={value === o.value ? "active" : ""}
              onClick={() => select(o.value)}
            >
              {o.initials && o.color && <Avatar initials={o.initials} color={o.color} />}
              {o.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
