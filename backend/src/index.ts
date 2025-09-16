import { Hono } from "hono"
import { Geohashing } from "./geohashing"
import { DateTime } from "luxon"

const app = new Hono()
console.log("Starting Geohash Alert")

app.get("/api/v1/hello", (c) => {
  return c.text("Hello Hono!")
})

const geohashing = new Geohashing()
const geoHash = await geohashing.getGeohash(DateTime.now(), ["51", "-0"])
console.log("GeoHash:", geoHash)

export default app
