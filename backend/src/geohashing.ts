import { DateTime } from "luxon"
import { createHash } from "node:crypto"

/** @see https://geohashing.site/geohashing/Dow_Jones_Industrial_Average */
// Alternative servers: www1.geo.crox.net or www2.geo.crox.net
const CROX_JDIA_API_BASE = "http://geo.crox.net/djia"

async function fetchJDIA(date: DateTime): Promise<string | null> {
  const dateString = date.toISODate()
  const url = new URL(`/${dateString}`, CROX_JDIA_API_BASE)
  const res = await fetch(url)
  const content = await res.text()
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch JDIA: ${content}`)

  // const jdiaValue = parseFloat(content)
  // if (isNaN(jdiaValue)) throw new Error(`Invalid JDIA value: ${content}`)
  return content.trim()
}

function getApplicableDate(givenDate: DateTime): DateTime {
  // TODO: support holidays, 30W rule, etc
  if (givenDate.weekday >= 6) {
    // Use Friday's closing value during the weekend
    return givenDate.set({ weekday: 5 })
  }
  // Previous day
  return givenDate.minus({ days: 1 })
}

export const NegativeZero = Symbol("NegativeZero")
export type NegativeZero = typeof NegativeZero
export type Graticule = [number | NegativeZero, number | NegativeZero]

export class Geohashing {
  constructor() {}

  async getGeohash(
    givenDate: DateTime,
    graticule: Graticule
  ): Promise<string | null> {
    const applicableDate = getApplicableDate(givenDate)
    const jdiaValue = await fetchJDIA(applicableDate)
    if (jdiaValue === null) return null // Geohash not yet known
    const geohashString = `${applicableDate.toISODate()}-${jdiaValue}`
    const hash = createHash("md5").update(geohashString).digest("hex")
    const [latHash, lonHash] = [hash.slice(0, 16), hash.slice(16)]
    // Treating the hashes as the fractional part of a hex number between 0 and 1, convert them to decimal
    const [latDecimal, lonDecimal] = [latHash, lonHash].map((h) => {
      let decimal = 0.0
      h.split("").forEach((char, i) => {
        const digit = parseInt(char, 16)
        decimal += digit / Math.pow(16, i + 1)
      })
      return decimal
    })
  }
}
