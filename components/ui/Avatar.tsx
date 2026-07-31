/**
 * Avatar de reseña: 70×70 cuadrado sin redondear, como pide el spec §7.
 *
 * Es un SVG con iniciales, no una fotografía, y es una decisión deliberada: no
 * hay fotos de clientes reales disponibles, e ilustrar testimonios con caras de
 * stock de personas que no existen sería deshonesto para un negocio real.
 *
 * Cuesta 0 bytes de red, no tiene problemas de derechos, y cumple la medida del
 * spec exactamente.
 */
export function Avatar({ name, size = 70 }: { name: string; size?: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <svg
      className="review-avatar"
      width={size}
      height={size}
      viewBox="0 0 70 70"
      role="img"
      aria-label={`Iniciales de ${name}`}
    >
      <rect width="70" height="70" fill="var(--gray)" />
      <text
        x="35"
        y="35"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--ff-display)"
        fontSize="26"
        fontWeight="500"
        fill="var(--text-dark)"
      >
        {initials}
      </text>
    </svg>
  );
}
