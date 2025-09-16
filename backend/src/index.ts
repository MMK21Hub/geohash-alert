import { Hono } from "hono"
import { Geohashing } from "./geohashing"
import { DateTime } from "luxon"

const app = new Hono()
console.log("Starting Geohash Alert")

app.get("/api/v1/hello", (c) => {
  return c.text("Hello Hono!")
})

const geohashing = new Geohashing()
console.log(
  "GeoHash 2:",
  await geohashing.getGeohash(DateTime.now(), ["51", "-0"])
)

export default app
