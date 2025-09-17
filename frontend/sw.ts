/// <reference lib="webworker" />
self.addEventListener("push", (event: PushEvent) =>
  event.waitUntil(handlePush(event))
)

async function handlePush(event: PushEvent) {
  const data = event.data?.json() || {}
  const selfRegistration = await navigator.serviceWorker.getRegistration("/")
  console.log("Registration", selfRegistration, "sending notification", data)
  if (data.type === "test-alert") {
    await selfRegistration?.showNotification(
      "Geohash Alert (manually triggered)",
      {
        body: `This is a test alert sent at ${data.time}`,
        icon: "/icon.png",
      }
    )
    return
  }
  await selfRegistration.showNotification(data.title || "Geohash Alert", {
    body: data.body || JSON.stringify(data),
    icon: "/icon.png",
  })
}
