export const serviceWorkerRegistration =
  navigator.serviceWorker.register("/sw.js")

serviceWorkerRegistration.then(async (reg) => {
  await reg.update()
})

export {}
