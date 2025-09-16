import { Hono } from "hono"
import { Geohashing } from "./geohashing"
import { DateTime } from "luxon"
import { zValidator } from "@hono/zod-validator"
import * as z from "zod/v4"

const app = new Hono()
const geohashing = new Geohashing()
console.log("Starting Geohash Alert...")

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
    const graticule = Geohashing.coordsToGraticule(lat, lng)
    const location = await geohashing.getGeohash(
      DateTime.fromISO(date),
      graticule
    )
    return c.json({ geohash: { location, graticule } })
  }
)

console.log(
  "GeoHash 2:",
  await geohashing.getGeohash(DateTime.now(), ["51", "-0"])
)

export default app
