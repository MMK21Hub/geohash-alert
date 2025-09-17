import { $ } from "voby"
import { serviceWorkerRegistration } from "./service-worker-manager"
import { coordsToGraticule, LatLng } from "@mmk21/geohashing/helpers"

async function subscribeToAlerts(homeCoords: LatLng) {
  const sw = await serviceWorkerRegistration
  const homeGraticule = coordsToGraticule(...homeCoords)
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    // TODO: env
    applicationServerKey:
      "BOaKJCR8niTjyJm8Bcuh4GZKdmGLd4rOgH5a63xYmDWAvSRKK4F4ednFKfm92Qnm6vXmDJMsdr-tfGM7thl2EBU",
  })
  const res = await fetch("/api/v1/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription,
      homeGraticule,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error("Failed to subscribe, API request failed", data)
    return alert(`Failed to subscribe: ${data.error.message}`)
  }
  alert("Subscribed :D")
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
            const input = document.getElementById("home-coords")
            if (!(input instanceof HTMLInputElement))
              throw new Error("Failed to find input element")
            const coords = input.value.split(",").map((c) => parseFloat(c))
            if (coords.length !== 2 || coords.some((c) => isNaN(c))) {
              input.setCustomValidity(
                "Please enter valid coordinates (in the format 51.50741, 0.12782)"
              )
              input.reportValidity()
              return
            }
            subscribeToAlerts(coords as LatLng)
            return false
          }}
        >
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
          <div class="mt-8 text-md text-base-content/80">
            When would you like to receive daily alerts? They will be scheduled
            in your local timezone ({timeZone}).
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
          <br />
          <button type="submit" class="btn mt-8">
            Subscribe to alerts
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
