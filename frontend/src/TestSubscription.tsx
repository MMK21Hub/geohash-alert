export default function TestSubscription({
  subscription,
}: {
  subscription: PushSubscription
}) {
  return (
    <div class="p-4 mt-12 bg-base-200 rounded-md shadow-md w-full max-w-sm space-y-4">
      <h2 class="text-xl font-semibold ">Test your subscription</h2>
      <button
        class="btn btn-neutral"
        onClick={() => {
          fetch("/api/v1/test-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription }),
          })
        }}
      >
        Send notification
      </button>
    </div>
  )
}
