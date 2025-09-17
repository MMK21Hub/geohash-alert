import { serviceWorkerRegistration } from "./service-worker-manager"
import { currentSubscription } from "./subscription-manager"

export default function Unsubscribe() {
  const handleUnsubscribe = async () => {
    const reg = await serviceWorkerRegistration
    const subscription = await reg.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    } else {
      console.warn(
        "Unsubscribe button clicked but the service worker does not hold a subscription"
      )
    }
    currentSubscription(null)
  }

  return (
    <div class="card bg-base-100 shadow-md mt-8 mb-4">
      <div class="card-body p-4">
        <h2 class="card-title text-lg font-semibold mb-2">
          Remove subscription
        </h2>
        <p class="text-sm mb-4">
          Stop receiving geohash alerts on this device.
        </p>
        <button class="btn btn-error" onClick={handleUnsubscribe}>
          Unsubscribe
        </button>
      </div>
    </div>
  )
}
