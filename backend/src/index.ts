import { Hono } from "hono"
import {
  coordsToGraticule,
  Geohashing,
  type Graticule,
} from "@mmk21/geohashing"
import { DateTime } from "luxon"
import { zValidator } from "@hono/zod-validator"
import {
  sendNotification,
  setVapidDetails,
  type PushSubscription,
} from "web-push"
import * as z from "zod/v4"
import { cleanEnv, str } from "envalid"
import type { AlertMessage, TestAlertMessage } from "./message"

const env = cleanEnv(process.env, {
  VAPID_PUBLIC_KEY: str(),
  VAPID_PRIVATE_KEY: str(),
  VAPID_CONTACT_URI: str(),
})

console.log("Starting Geohash Alert...")
const app = new Hono()
const geohashing = new Geohashing()

setVapidDetails(
  env.VAPID_CONTACT_URI,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
)

const PushSubscription = z.object({
  endpoint: z.url(),
  expirationTime: z.number().positive().nullable(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

const Lat = z.coerce.number().min(-90).max(90)
const Lng = z.coerce.number().min(-180).max(180)

// TODO: We need a database :p
const subscriptions: {
  subscription: PushSubscription
  homeGraticule: Graticule
}[] = []

app.get("/api/v1/hello", (c) => {
  return c.text("Hello Hono!")
})

app.get(
  "/api/v1/geohash",
  zValidator(
    "query",
    z.object({
      date: z.iso.date(),
      lat: Lat,
      lng: Lng,
    })
  ),
  async (c) => {
    const { date, lat, lng } = c.req.valid("query")
    if (lng < -30)
      return c.json(
        {
          success: false,
          error: {
            name: "NotImplementedError",
            message: "Locations west of 30°W are not supported yet",
          },
        },
        400
      )
    const graticule = coordsToGraticule(lat, lng)
    const location = await geohashing.getGeohash(
      DateTime.fromISO(date),
      graticule
    )
    return c.json({ geohash: { location, graticule } })
  }
)

app.post(
  "/api/v1/subscribe",
  zValidator(
    "json",
    z.object({
      subscription: PushSubscription,
      homeGraticule: z.tuple([z.string(), z.string()]).refine(([lat, lng]) => {
        return Lat.safeParse(lat).success && Lng.safeParse(lng).success
      }),
    })
  ),
  async (c) => {
    const { subscription, homeGraticule } = c.req.valid("json")
    subscriptions.push({ subscription, homeGraticule })
    console.debug(
      `New subscription received for ${homeGraticule} with endpoint ${subscription.endpoint}`
    )
    return c.json({ success: true })
  }
)

app.post(
  "/api/v1/test-subscription",
  zValidator(
    "json",
    z.object({
      subscription: PushSubscription,
    })
  ),
  async (c) => {
    const provided = c.req.valid("json")
    const entry = subscriptions.find(
      (sub) => sub.subscription.endpoint === provided.subscription.endpoint
    )
    if (!entry)
      return c.json(
        {
          success: false,
          error: {
            name: "NotFoundError",
            message: "Subscription not found in database",
          },
        },
        404
      )

    const geohashCoords = await geohashing.getGeohash(
      DateTime.now(),
      entry.homeGraticule
    )
    const message: TestAlertMessage = {
      type: "alert",
      isTest: true,
      geohash: geohashCoords
        ? {
            graticule: entry.homeGraticule,
            location: geohashCoords,
          }
        : undefined,
    }
    console.debug("Sending test notification", message)
    await sendNotification(entry.subscription, JSON.stringify(message))
    return c.json({ success: true })
  }
)

export default app
