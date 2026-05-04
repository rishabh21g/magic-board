import MagicBoard from "./components/MagicBoard"
import { useBoardSocket } from "./hooks/useBoardSocket"

const App = () => {
  useBoardSocket()
  return (
    <MagicBoard/>
  )
}

export default App