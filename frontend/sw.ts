import type { LatLng } from "@mmk21/geohashing"
import type { PushMessage } from "../backend/src/message"

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
  const title = data.isTest
    ? "Geohash Alert (manually triggered)"
    : "Nearby geohash"
  const body = `Today's geohash for ${
    data.geohash.graticule
  } is TODOm away, at ${formatCoords(data.geohash.location)}`
  await selfRegistration.showNotification(title, {
    body: body,
    icon: "/icon.png",
  })
}
