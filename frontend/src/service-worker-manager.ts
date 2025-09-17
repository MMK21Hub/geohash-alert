export let serviceWorkerRegistration = navigator.serviceWorker.register(
  "/sw.js",
  { type: "module" }
)

serviceWorkerRegistration.then(async (reg) => {
  await reg.unregister()
  serviceWorkerRegistration = navigator.serviceWorker.register("/sw.js", {
    type: "module",
  })
  await serviceWorkerRegistration
  console.debug("Refreshed service worker", reg)
})

export {}
