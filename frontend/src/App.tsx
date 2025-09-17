import { $, useEffect } from "voby"
import { serviceWorkerRegistration } from "./service-worker-manager"
import { coordsToGraticule, LatLng } from "@mmk21/geohashing/helpers"
import TestSubscription from "./TestSubscription"
import { GeohashSubscriptionInfo } from "./types"

const currentSubscription = $<GeohashSubscriptionInfo | null>(
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

async function sendSubscriptionToServer(info: GeohashSubscriptionInfo) {
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

async function subscribeToAlerts({
  homeCoords,
  timeZone,
  time,
  maxDistance,
}: {
  homeCoords: LatLng
  time: string
  timeZone: string
  maxDistance: number
}) {
  const sw = await serviceWorkerRegistration
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    // TODO: env
    applicationServerKey:
      "BOaKJCR8niTjyJm8Bcuh4GZKdmGLd4rOgH5a63xYmDWAvSRKK4F4ednFKfm92Qnm6vXmDJMsdr-tfGM7thl2EBU",
  })

  const subscriptionInfo: GeohashSubscriptionInfo = {
    subscription,
    homeCoords,
    time,
    timeZone,
    maxDistance,
  }
  try {
    await sendSubscriptionToServer(subscriptionInfo)
  } catch (e) {
    return alert(`Failed to subscribe: ${e}`)
  }
  currentSubscription(subscriptionInfo)
  alert("Success! You have subscribed to geohash alerts.")
}

function App(): JSX.Element {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <div>
      <div class="navbar bg-base-100 shadow-sm">
        <a class="btn btn-ghost text-xl" href="/">
          Geohash Alert
        </a>
      </div>
      <main class="py-6 px-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const homeInput = document.getElementById("home-coords")
            if (!(homeInput instanceof HTMLInputElement))
              throw new Error("Failed to find home coordinates input element")
            const coords = homeInput.value.split(",").map((c) => parseFloat(c))
            if (coords.length !== 2 || coords.some((c) => isNaN(c))) {
              homeInput.setCustomValidity(
                "Please enter valid coordinates (in the format 51.50741, 0.12782)"
              )
              homeInput.reportValidity()
              return
            }
            const timeInput = document.getElementById("notification-time")
            if (!(timeInput instanceof HTMLInputElement))
              throw new Error("Failed to find time input element")
            const time = timeInput.value
            subscribeToAlerts({
              homeCoords: coords as LatLng,
              timeZone,
              time,
              maxDistance: Infinity,
            })
            return false
          }}
          class="space-y-8"
        >
          <div>
            <label class="floating-label">
              <span>Enter your home coordinates</span>
              <input
                type="text"
                placeholder="Enter your home coordinates, e.g. 51.50741, 0.12782"
                id="home-coords"
                required
                class="input input-md w-full max-w-sm"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement
                  input.setCustomValidity("")
                }}
              />
            </label>
          </div>
          <div>
            <div class="text-md text-base-content/80">
              When would you like to receive daily alerts? They will be
              scheduled in your local timezone ({timeZone}).
            </div>
            <label class="input w-full min-w-[15em] max-w-sm mt-4">
              <span class="label">Notification time</span>
              <input
                type="time"
                id="notification-time"
                required
                value="07:15"
                class=""
              />
            </label>
          </div>
          <div>
            <button type="submit" class="btn">
              Subscribe to alerts
            </button>
          </div>
        </form>
        {() => {
          const sub = currentSubscription()
          return sub && <TestSubscription subscription={sub.subscription} />
        }}
      </main>
    </div>
  )
}

export default App
