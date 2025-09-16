/// <reference lib="webworker" />
self.addEventListener("push", (event: PushEvent) =>
  event.waitUntil(handlePush(event))
)

async function handlePush(event: PushEvent) {
  const data = event.data?.json() || {}
  const selfRegistration = await navigator.serviceWorker.getRegistration("/")
  console.log("Registration", selfRegistration, "sending notification", data)
  await selfRegistration.showNotification(data.title || "Geohash Alert", {
    body: data.body || "",
    icon: "/icon.png",
  })
}
