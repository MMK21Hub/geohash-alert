import type { PushMessage } from "../backend/src/message"

/// <reference lib="webworker" />
self.addEventListener("push", (event: PushEvent) =>
  event.waitUntil(handlePush(event))
)

async function handlePush(event: PushEvent) {
  const data: PushMessage = event.data?.json()
  const selfRegistration = await navigator.serviceWorker.getRegistration("/")
  console.log("Registration", selfRegistration, "sending notification", data)
  const title = data.isTest
    ? "Geohash Alert (manually triggered)"
    : "Nearby geohash"
  const body = `Today's geohash for ${data.geohash.graticule} is TODOm away, at ${data.geohash.location}`
  await selfRegistration.showNotification(title, {
    body: body,
    icon: "/icon.png",
  })
}
