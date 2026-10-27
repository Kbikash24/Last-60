export function Logo3D({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <span className={`logo-3d ${className}`}>
      <span className="logo-3d-back" aria-hidden="true">
        {text}
      </span>
      <span className="logo-3d-face">{text}</span>
    </span>
  );
}
