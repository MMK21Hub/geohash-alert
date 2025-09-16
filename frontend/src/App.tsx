import { $ } from "voby"

function App(): JSX.Element {
  return (
    <div>
      <header>
        <h1>Geohash Alert</h1>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <label for="home-coords">Enter your home coordinates:</label>
        <input type="text" id="home-coords" placeholder="51.50741, 0.12782" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default App
