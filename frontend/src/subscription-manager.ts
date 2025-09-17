import { $, useEffect } from "voby"
import { GeohashSubscriptionInfo } from "./types"
import { coordsToGraticule } from "@mmk21/geohashing/helpers"

export const currentSubscription = $<GeohashSubscriptionInfo | null>(
  JSON.parse(localStorage.getItem("geohash-alert-subscription") || "null")
)
const subscriptionUpdateChannel = new BroadcastChannel("subscription-updates")
const getSubscriptionInfoChannel = new BroadcastChannel("get-subscription-info")
useEffect(() => {
  localStorage.setItem(
    "geohash-alert-subscription",
    JSON.stringify(currentSubscription())
  )
})
// subscriptionUpdateChannel.addEventListener("message", async (event) => {
//   const newSubscription = event.data as PushSubscription
// note: this should do the same thing as the thing in navigator.serviceWorker.ready.then below
// })
getSubscriptionInfoChannel.addEventListener("message", (event) => {
  getSubscriptionInfoChannel.postMessage(JSON.stringify(currentSubscription()))
})

// When the browser updates the subscription URL in the background
navigator.serviceWorker.ready.then(async (registration) => {
  const newSubscription = await registration.pushManager.getSubscription()
  const currentSub = currentSubscription()?.subscription
  if (!currentSub)
    return console.warn("No stored subscription, not checking for update")
  if (!newSubscription)
    return console.warn(
      "No subscription stored on PushManager, not checking for update"
    )
  if (newSubscription.endpoint === currentSub.endpoint)
    return console.debug("Subscription endpoint unchanged, all is good")
  console.info("Subscription endpoint changed, updating stored subscription")
  const oldSubscriptionInfo = currentSubscription()
  if (!oldSubscriptionInfo)
    return console.warn(
      "Failed to update subscription: no previous subscription in memory"
    )
  oldSubscriptionInfo.subscription = newSubscription
  console.debug(
    "Browser updated subscription in the background, sending latest subscription to server.",
    "New subscription:",
    newSubscription
  )
  try {
    await sendSubscriptionToServer(oldSubscriptionInfo)
  } catch (e) {
    return console.error("Failed to update subscription on server", e)
  }
  currentSubscription(oldSubscriptionInfo)
})

export async function sendSubscriptionToServer(info: GeohashSubscriptionInfo) {
  const homeGraticule = coordsToGraticule(...info.homeCoords)
  const res = await fetch("/api/v1/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription: info.subscription,
      homeGraticule,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error("Failed to subscribe, API request failed", data)
    throw new Error(data.error?.message)
  }
}
