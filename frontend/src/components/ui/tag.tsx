type Props = {
  label: string;
  className?: string;
};

export default function Tag({ label, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-1 rounded leading-none ${className}`}>
      <i className="fa-solid fa-flag" style={{ fontSize: "9px" }} />
      {label}
    </span>
  );
}
