import { Hono } from "hono"
import { Geohashing } from "./geohashing"
import { DateTime } from "luxon"
import { zValidator } from "@hono/zod-validator"
import { setVapidDetails, type PushSubscription } from "web-push"
import * as z from "zod/v4"
import { cleanEnv, str } from "envalid"

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

// TODO: We need a database :p
const subscriptions: PushSubscription[] = []

app.get("/api/v1/hello", (c) => {
  return c.text("Hello Hono!")
})

app.get(
  "/api/v1/geohash",
  zValidator(
    "query",
    z.object({
      date: z.iso.date(),
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
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
    const graticule = Geohashing.coordsToGraticule(lat, lng)
    const location = await geohashing.getGeohash(
      DateTime.fromISO(date),
      graticule
    )
    return c.json({ geohash: { location, graticule } })
  }
)

app.post(
  "/api/v1/subscribe",
  zValidator("json", PushSubscription),
  async (c) => {
    const subscription = c.req.valid("json")
    subscriptions.push(subscription)
    console.debug(
      `New subscription received with endpoint ${subscription.endpoint}`
    )
    return c.json({ success: true })
  }
)

export default app
