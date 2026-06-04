import type { HeatmapResponse } from "@/shared/api/stats"

export const HEATMAP_MOCK: HeatmapResponse = {
  total_articles: 428,
  entries: [
    {
      place_id: 1,
      name: "Ucrania",
      slug: "ucrania",
      country_code: "UKR",
      map_country_codes: ["UKR"],
      article_count: 89,
    },
    {
      place_id: 2,
      name: "Estados Unidos",
      slug: "estados-unidos",
      country_code: "USA",
      map_country_codes: ["USA"],
      article_count: 72,
    },
    {
      place_id: 3,
      name: "China",
      slug: "china",
      country_code: "CHN",
      map_country_codes: ["CHN"],
      article_count: 54,
    },
    {
      place_id: 4,
      name: "Rusia",
      slug: "rusia",
      country_code: "RUS",
      map_country_codes: ["RUS"],
      article_count: 48,
    },
    {
      place_id: 5,
      name: "Europa",
      slug: "europa",
      country_code: null,
      map_country_codes: [],
      article_count: 381,
    },
    {
      place_id: 6,
      name: "Bosnia y Herzegovina",
      slug: "bosnia-y-herzegovina",
      country_code: "BIH",
      map_country_codes: ["BIH"],
      article_count: 13,
    },
  ],
}

export const fetchHeatmapMock = async (): Promise<HeatmapResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 320))
  return HEATMAP_MOCK
}
