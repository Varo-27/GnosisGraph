/**
 * Nombre en español (estilo EOM) para búsqueda semántica al clicar un país en el mapa,
 * aunque no exista en el heatmap. No usar macro-regiones como sustituto.
 */

const ISO_SEARCH_LABEL: Record<string, string> = {
  USA: "Estados Unidos",
  GBR: "Reino Unido",
  ARE: "Emiratos Árabes Unidos",
  COD: "República Democrática del Congo",
  COG: "República del Congo",
  CAF: "República Centroafricana",
  DOM: "República Dominicana",
  CZE: "República Checa",
  MKD: "Macedonia",
  KOR: "Corea del Sur",
  PRK: "Corea del Norte",
  NZL: "Nueva Zelanda",
  SAU: "Arabia Saudí",
  ZAF: "Sudáfrica",
  TLS: "Timor Oriental",
  BIH: "Bosnia y Herzegovina",
  VAT: "Ciudad del Vaticano",
  ATG: "Antigua y Barbuda",
  TTO: "Trinidad y Tobago",
  BHS: "Bahamas",
  GUF: "Guayana Francesa",
  FSM: "Micronesia",
  PLW: "Islas Palaos",
  SLB: "Islas Salomón",
  SHN: "Santa Elena",
  CIV: "Costa de Marfil",
  GNB: "Guinea-Bissau",
  GNQ: "Guinea Ecuatorial",
  ESH: "Sáhara Occidental",
  SSD: "Sudán del Sur",
  XKX: "Kosovo",
  ZWE: "Zimbabue",
  BTN: "Bután",
  SOM: "Somalia",
}

function slugToLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => {
      if (part.length <= 2) return part.toUpperCase()
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")
}

/** Rellena desde placeGeoResolve slugs cuando no hay etiqueta fija. */
export function registerPlaceSlugLabels(placeToIso: Record<string, string>) {
  for (const [slug, iso] of Object.entries(placeToIso)) {
    if (!ISO_SEARCH_LABEL[iso]) {
      ISO_SEARCH_LABEL[iso] = slugToLabel(slug)
    }
  }
}

export function getCountrySearchLabel(
  isoCode: string,
  geoFallbackName?: string,
) {
  const fixed = ISO_SEARCH_LABEL[isoCode.trim().toUpperCase()]
  if (fixed) return fixed
  if (geoFallbackName?.trim()) return geoFallbackName.trim()
  return isoCode
}
