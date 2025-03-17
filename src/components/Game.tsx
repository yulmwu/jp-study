import { useSettings, defaultSettings } from './StartMenu'

const Game = () => {
    const back = () => useSettings.setState(defaultSettings)
    return (
        <div className='container'>
            <div className='card'>
                <p onClick={back}>뒤로 가기</p>
            </div>
        </div>
    )
}

export default Game
