import type { GeohashSubscriptionInfo } from "./types"

export default function SubscriptionInfo({
  subscription,
}: {
  subscription: GeohashSubscriptionInfo
}): JSX.Element {
  const { homeCoords, time, timeZone, maxDistance } = subscription
  const maxDistanceDisplay =
    maxDistance === Infinity
      ? "at any distance"
      : `${maxDistance / 1000} km or closer`
  // LatLng is a tuple: [number, number]
  const [lat, lng] = homeCoords
  return (
    <div class="card bg-base-100 shadow-md mb-4">
      <div class="card-body p-4">
        <h2 class="card-title text-lg font-semibold mb-2">Subscription info</h2>
        <ul class="text-sm space-y-1">
          <li>
            <span class="">Home coordinates:</span> {lat.toFixed(5)},{" "}
            {lng.toFixed(5)}
          </li>
          <li>
            <span class="">Alerts are scheduled for {time} </span>
            <span class="text-xs text-gray-500">({timeZone})</span>
          </li>
          <li>
            <span class="">Alerting for geohashes {maxDistanceDisplay}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
