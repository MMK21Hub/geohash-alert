import TestSubscription from "./TestSubscription"
import { currentSubscription } from "./subscription-manager"
import Subscribe from "./Subscribe"
import SubscriptionInfo from "./SubscriptionInfo"
import Unsubscribe from "./Unsubscribe"

function App(): JSX.Element {
  return (
    <div>
      <div class="navbar bg-base-100 shadow-sm">
        <a class="btn btn-ghost text-xl" href="/">
          Geohash Alert
        </a>
      </div>
      <main class="py-6 px-4 max-w-3xl mx-auto">
        {() => {
          const sub = currentSubscription()
          return sub ? (
            <>
              <SubscriptionInfo subscription={sub} />
              <Unsubscribe />
              <TestSubscription subscription={sub.subscription} />
            </>
          ) : (
            <Subscribe />
          )
        }}
      </main>
    </div>
  )
}

export default App
