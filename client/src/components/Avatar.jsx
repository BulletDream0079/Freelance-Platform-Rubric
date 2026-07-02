function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 55%)`;
}

export default function Avatar({ user, size = 40, className = "" }) {
  const name = user?.name || "";
  const dimension = typeof size === "number" ? `${size}px` : size;
  const style = { width: dimension, height: dimension };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={`avatar-img ${className}`}
        style={{ ...style, objectFit: "cover", borderRadius: "50%" }}
      />
    );
  }

  return (
    <div
      className={`avatar-initials ${className}`}
      style={{
        ...style,
        borderRadius: "50%",
        background: colorFor(name),
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: `calc(${dimension} * 0.4)`,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials(name)}
    </div>
  );
}
