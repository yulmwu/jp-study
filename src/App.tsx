import React from 'react'
import './App.css'

import StartMenu, { useSettings } from './components/StartMenu'

const App = () => {
    return <div className='App'>{useSettings((state) => state.playing) ? <div>Game</div> : <StartMenu />}</div>
}

export default App
