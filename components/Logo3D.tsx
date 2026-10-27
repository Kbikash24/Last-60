export function Logo3D({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <span className={`logo-3d ${className}`}>
      <span className="logo-3d-back" aria-hidden="true" data-text={text} />
      <span className="logo-3d-face">{text}</span>
    </span>
  );
}
