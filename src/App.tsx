import { useEffect, useState } from "react"
import CanvasGrid from "./components/Grid/CanvasGrid"
import { generateUUID } from "./lib/uuid"
import { LandingPage } from "./components/LandingPage"

const App = () => {
  const [userID, setuserID] = useState("")
  const [started, setStarted] = useState(false)

  useEffect(() => {
    let id = localStorage.getItem("userID")
    if (!id) {
      id = generateUUID()
      localStorage.setItem("userID", id)
    }
    setuserID(id)
  }, [])

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />
  }

  return <CanvasGrid userID={userID} />
}

export default App