import type { LatLng } from "@mmk21/geohashing"
import type { PushMessage } from "../backend/src/message"
import type { GeohashSubscriptionInfo } from "./src/types"

// Source: https://github.com/dcousens/haversine-distance, licenced under MIT by Daniel Cousens
function haversineDistance(a: LatLng, b: LatLng) {
  const atan2 = Math.atan2
  const cos = Math.cos
  const sin = Math.sin
  const sqrt = Math.sqrt
  // equatorial mean radius of Earth (in meters)
  const R = 6378137

  function squared(x: number) {
    return x * x
  }
  function toRad(x: number) {
    return (x * Math.PI) / 180.0
  }
  function hav(x: number) {
    return squared(sin(x / 2))
  }

  const aLat = toRad(a[1])
  const bLat = toRad(b[1])
  const aLng = toRad(a[0])
  const bLng = toRad(b[0])
  const ht = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLng - aLng)
  return 2 * R * atan2(sqrt(ht), sqrt(1 - ht))
}

/// <reference lib="webworker" />
self.addEventListener("push", (event: PushEvent) =>
  event.waitUntil(handlePush(event))
)

function formatCoords(coords: LatLng): string {
  return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
}

async function getSelfRegistration() {
  try {
    return await navigator.serviceWorker.getRegistration("/")
  } catch {
    // @ts-ignore ???!
    return self.registration
  }
}

function getSubscriptionInfo(): Promise<GeohashSubscriptionInfo> {
  // FIXME this is so so terribly jank, I hate it
  return new Promise((resolve) => {
    getSubscriptionInfoChannel.addEventListener("message", (event) => {
      resolve(JSON.parse(event.data) as GeohashSubscriptionInfo)
    })
    getSubscriptionInfoChannel.postMessage("get")
  })
}

async function handlePush(event: PushEvent) {
  self.registration.showNotification("Push received!", {
    body: "This proves the SW is working",
  })
  const data: PushMessage = event.data?.json()
  const selfRegistration = await getSelfRegistration()
  console.log("Registration", selfRegistration, "sending notification", data)
  const subscriptionInfo = await getSubscriptionInfo()
  const distance = haversineDistance(
    subscriptionInfo.homeCoords,
    data.geohash.location
  )
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

const subscriptionUpdateChannel = new BroadcastChannel("subscription-updates")
const getSubscriptionInfoChannel = new BroadcastChannel("get-subscription-info")

async function handleSubscriptionChange(event: PushSubscriptionChangeEvent) {
  console.log("Subscription expired, renewing", event)
  subscriptionUpdateChannel.postMessage(event.newSubscription)
}

self.addEventListener(
  "pushsubscriptionchange",
  (event: PushSubscriptionChangeEvent) =>
    event.waitUntil(handleSubscriptionChange(event))
)
