declare module "d3-geo-projection" {
  import type { GeoProjection } from "d3-geo"

  export function geoWinkel3(): GeoProjection
  export function geoBertin1953(): GeoProjection
  export function geoRobinson(): GeoProjection
  export function geoMollweide(): GeoProjection
  export function geoHomolosine(): GeoProjection
}
