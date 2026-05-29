import { describe, expect, it } from "vitest"

import { buildCountryCounts, getMaxCount } from "@/lib/heatmapColors"

describe("buildCountryCounts", () => {
  it("agrega artículos por código de país directo", () => {
    const counts = buildCountryCounts([
      { country_code: "ES", article_count: 10 },
      { country_code: "ES", article_count: 5 },
      { country_code: "FR", article_count: 3 },
    ])

    expect(counts.get("ES")).toBe(15)
    expect(counts.get("FR")).toBe(3)
  })

  it("ignora entradas regionales con map_country_codes múltiples", () => {
    const counts = buildCountryCounts([
      {
        country_code: null,
        map_country_codes: ["ES", "PT"],
        article_count: 20,
      },
      { country_code: "ES", article_count: 4 },
    ])

    expect(counts.get("ES")).toBe(4)
    expect(counts.has("PT")).toBe(false)
  })
})

describe("getMaxCount", () => {
  it("devuelve el máximo valor del mapa", () => {
    const counts = new Map([
      ["ES", 10],
      ["FR", 25],
      ["DE", 5],
    ])

    expect(getMaxCount(counts)).toBe(25)
  })

  it("devuelve 0 para mapa vacío", () => {
    expect(getMaxCount(new Map())).toBe(0)
  })
})
