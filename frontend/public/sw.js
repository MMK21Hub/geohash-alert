self.addEventListener("push", handlePush())

/** @param {PushEvent} event */
function handlePush(event) {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || "Geohash Alert", {
      body: data.body || "",
      icon: "/icon.png",
    })
  )
}
