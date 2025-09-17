import type { LatLng } from "@mmk21/geohashing"
import type { PushMessage } from "../backend/src/message"
import haversine from "haversine-distance"
import type { GeohashSubscriptionInfo } from "./src/types"

/// <reference lib="webworker" />
self.addEventListener("push", (event: PushEvent) =>
  event.waitUntil(handlePush(event))
)

function formatCoords(coords: LatLng): string {
  return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
}

async function handlePush(event: PushEvent) {
  const data: PushMessage = event.data?.json()
  const selfRegistration = await navigator.serviceWorker.getRegistration("/")
  console.log("Registration", selfRegistration, "sending notification", data)
  const subscriptionInfo: GeohashSubscriptionInfo = JSON.parse(
    localStorage.getItem("geohash-alert-subscription")
  )
  const distance = haversine(subscriptionInfo.homeCoords, data.geohash.location)
  const title = data.isTest
    ? "Geohash Alert (manually triggered)"
    : "Nearby geohash"
  const body = `Today's geohash for ${
    data.geohash.graticule
  } is ${distance.toLocaleString()} m away, at ${formatCoords(
    data.geohash.location
  )}`
  await selfRegistration.showNotification(title, {
    body: body,
    icon: "/icon.png",
  })
}
