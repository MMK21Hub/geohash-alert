import type { GeohashSubscriptionInfo } from "./types"

export default function SubscriptionInfo({
  subscription,
}: {
  subscription: GeohashSubscriptionInfo
}): JSX.Element {
  const { homeCoords, time, timeZone, maxDistance } = subscription
  // LatLng is a tuple: [number, number]
  const [lat, lng] = homeCoords
  return (
    <div class="card bg-base-100 shadow-md mb-4">
      <div class="card-body p-4">
        <h2 class="card-title text-lg font-semibold mb-2">
          Subscribed to Geohash Alerts
        </h2>
        <ul class="text-sm space-y-1">
          <li>
            <span class="font-medium">Home coordinates:</span> {lat.toFixed(5)},{" "}
            {lng.toFixed(5)}
          </li>
          <li>
            <span class="font-medium">Alert time:</span> {time}{" "}
            <span class="text-xs text-gray-500">({timeZone})</span>
          </li>
          <li>
            <span class="font-medium">Max distance:</span> {maxDistance} km
          </li>
        </ul>
      </div>
    </div>
  )
}
