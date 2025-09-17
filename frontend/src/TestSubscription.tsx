export default function TestSubscription({
  subscription,
}: {
  subscription: PushSubscription
}) {
  return (
    <div class="card bg-base-100 shadow-md mt-8 mb-4">
      <div class="card-body p-4">
        <h2 class="card-title text-lg font-semibold mb-2">
          Test your subscription
        </h2>
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
    </div>
  )
}
