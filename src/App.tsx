import './App.css'
import TeraCheckMiniGame from './component/tera-game'

function App() {
  return (
      <div className="bg-[url('/assets/images/BG.png')] bg-cover bg-center min-h-screen max-w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-90 backdrop-blur-sm"></div>
          <div className="relative z-10">
              <TeraCheckMiniGame />
          </div>
      </div>
  )
}

export default App
