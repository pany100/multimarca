export function normalizeArgentinePhone(raw: string): string {
  // 1. Quitar todos los caracteres no numéricos
  let digits = raw.replace(/\D/g, "");

  // 2. Si empieza con "0" → quitar el 0 inicial
  if (digits.startsWith("0")) digits = digits.slice(1);

  // 3. Si empieza con "54"...
  if (digits.startsWith("54")) {
    if (digits.length === 12) {
      // 549XXXXXXXXX (ya está bien)
    } else if (digits.length === 13) {
      // 5411XXXXXXXX (BA sin el 9) → insertar 9 después del 54
      digits = `549${digits.slice(2)}`;
    } else if (digits.length === 11) {
      // 54XXXXXXXXX → insertar 9 después del 54
      digits = `549${digits.slice(2)}`;
    }
  } else {
    // 4. Si NO empieza con "54"
    // El número restante debería tener 10 dígitos (código de área + número)
    if (digits.length < 10) {
      throw new Error(`Número de teléfono inválido: ${raw}`);
    }
    digits = `549${digits}`;
  }

  // 5. Validar resultado final
  if (digits.length !== 12 || !digits.startsWith("549")) {
    throw new Error(`No se pudo normalizar el teléfono: ${raw}`);
  }

  // 6. Retornar el string normalizado
  return digits;
}
