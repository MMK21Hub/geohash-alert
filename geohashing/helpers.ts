/** @example ["51", "-0"] */
export type Graticule = [string, string]
export type LatLng = [number, number]

export function coordsToGraticule(lat: number, lon: number): Graticule {
  // This method ensures we preserve negative zero
  const wholeNumberPartLat = lat.toString().split(".")[0]
  const wholeNumberPartLon = lon.toString().split(".")[0]
  return [wholeNumberPartLat, wholeNumberPartLon]
}
