import { $ } from "voby"

function App(): JSX.Element {
  return (
    <div>
      <div class="navbar bg-base-100 shadow-sm">
        <a class="btn btn-ghost text-xl" href="/">
          Geohash Alert
        </a>
      </div>
      <main class="py-6 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = document.getElementById("home-coords")
            if (!(input instanceof HTMLInputElement))
              throw new Error("Failed to find input element")
            const coords = input.value.split(",").map((x) => x.trim())
            if (coords.length !== 2 || coords.some((x) => isNaN(Number(x)))) {
              input.setCustomValidity(
                "Please enter valid coordinates (in the format 51.50741, 0.12782)"
              )
              input.reportValidity()
              return
            }
            input.setCustomValidity("")
            alert("yay")
          }}
        >
          <label class="floating-label">
            <span>Enter your home coordinates</span>
            <input
              type="text"
              placeholder="Enter your home coordinates, e.g. 51.50741, 0.12782"
              id="home-coords"
              required
              class="input input-md w-full max-w-sm"
              onInput={(e) => {
                const input = e.target as HTMLInputElement
                input.setCustomValidity("")
              }}
            />
          </label>
          <button type="submit" class="btn mt-6">
            Subscribe to alerts
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
