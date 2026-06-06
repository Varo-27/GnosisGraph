/** Lee un custom property CSS del documento (p. ej. tokens de tema). */
export function readCssVariable(
  name: string,
  element?: Element | null,
): string {
  const target = element ?? document.documentElement
  return getComputedStyle(target).getPropertyValue(name).trim()
}
