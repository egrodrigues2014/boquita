import { describe, expect, it } from "vitest";
import { formatCRC, formatCRCShort, formatFrom } from "@/lib/format";

describe("formatCRC", () => {
  it("agrupa millares con punto y mantiene el espacio tras el símbolo (spec §8)", () => {
    expect(formatCRC(14000)).toBe("₡ 14.000 CRC");
    expect(formatCRC(5500)).toBe("₡ 5.500 CRC");
    expect(formatCRC(500)).toBe("₡ 500 CRC");
  });

  it("agrupa correctamente por encima del millón", () => {
    expect(formatCRC(1000000)).toBe("₡ 1.000.000 CRC");
    expect(formatCRC(1234567)).toBe("₡ 1.234.567 CRC");
  });

  it("maneja el cero y los bordes de grupo", () => {
    expect(formatCRC(0)).toBe("₡ 0 CRC");
    expect(formatCRC(999)).toBe("₡ 999 CRC");
    expect(formatCRC(1000)).toBe("₡ 1.000 CRC");
  });

  it("redondea a colones enteros", () => {
    expect(formatCRC(14000.4)).toBe("₡ 14.000 CRC");
    expect(formatCRC(13999.6)).toBe("₡ 14.000 CRC");
  });

  it("usa el espacio ASCII (U+0020), nunca el espacio duro fino de Intl", () => {
    const out = formatCRC(12000);
    expect(out).toContain(" ");
    expect(out).not.toContain(" "); // narrow no-break space
    expect(out).not.toContain(" "); // no-break space
  });

  it("no coincide con Intl es-CR — el motivo de que esta función exista", () => {
    // Documenta el bug que se está evitando. Si algún día Intl se alineara con
    // el formato del spec, este test lo avisaría al fallar.
    const intl = new Intl.NumberFormat("es-CR").format(12000);
    expect(formatCRC(12000)).not.toBe(`₡ ${intl} CRC`);
  });
});

describe("formatCRCShort", () => {
  it("omite el código de moneda para el carrito y WhatsApp", () => {
    expect(formatCRCShort(6500)).toBe("₡ 6.500");
    expect(formatCRCShort(22000)).toBe("₡ 22.000");
  });
});

describe("formatFrom", () => {
  it("prefija 'desde' para precios con mínimo", () => {
    expect(formatFrom(22000)).toBe("desde ₡ 22.000 CRC");
  });
});
