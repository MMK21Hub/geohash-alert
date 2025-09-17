import type { Graticule, LatLng } from "@mmk21/geohashing"

export type PushMessage = AlertMessage | TestAlertMessage

interface Geohash {
  graticule: Graticule
  location: LatLng
  // TODO reverse geocode
}

export interface AlertMessage {
  type: "alert"
  isTest: boolean
  geohash: Geohash
}

export interface TestAlertMessage {
  type: "alert"
  isTest: true
  geohash?: Geohash
}
