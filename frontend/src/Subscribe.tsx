import type { LatLng } from "@mmk21/geohashing"
import { serviceWorkerRegistration } from "./service-worker-manager"
import { GeohashSubscriptionInfo } from "./types"
import {
  currentSubscription,
  sendSubscriptionToServer,
} from "./subscription-manager"
import { $ } from "voby"

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

export default function Subscribe() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const noDistanceLimit = $(false)
  return (
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
        const maxDistanceInput = document.getElementById("max-distance")
        if (!(maxDistanceInput instanceof HTMLInputElement))
          throw new Error("Failed to find max distance input element")
        const maxDistance = noDistanceLimit()
          ? Infinity
          : maxDistanceInput.valueAsNumber * 1000
        subscribeToAlerts({
          homeCoords: coords as LatLng,
          timeZone,
          time,
          maxDistance,
        })
        return false
      }}
      class="space-y-8"
    >
      <div>
        <p class="text-md text-base-content/80 mb-4">
          Provide a location to get alerts for nearby geohashes. Exact
          coordinates are stored securely in your browser, and approximate
          coordinates are sent to the server.
        </p>
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
      <div class="space-y-4">
        <p class="text-md text-base-content/80 ">
          How close should a geohash need to be for you to receive an alert?
        </p>
        <label class="input w-full min-w-[15em] max-w-sm">
          <span class="label">Maximum distance</span>
          <input
            type="number"
            id="max-distance"
            required
            min="0"
            step="0.5"
            value="5"
            class=""
            disabled={noDistanceLimit}
          />
          <span class="label">km</span>
        </label>
        <br />
        <label class="label">
          <input
            type="checkbox"
            checked={noDistanceLimit}
            onChange={() => noDistanceLimit(!noDistanceLimit())}
            class="toggle"
          />
          <span class={() => (noDistanceLimit() ? "text-base-content" : "")}>
            No distance limit
          </span>
        </label>
      </div>
      <div>
        <p class="text-md text-base-content/80 mb-4">
          When would you like to receive daily alerts? They will be scheduled in
          your local timezone ({timeZone}).
        </p>
        <label class="input w-full min-w-[15em] max-w-sm">
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
  )
}
