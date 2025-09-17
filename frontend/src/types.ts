import type { LatLng } from "@mmk21/geohashing"

export interface GeohashSubscriptionInfo {
  subscription: PushSubscription
  homeCoords: LatLng
  time: string
  timeZone: string
  maxDistance: number
}
