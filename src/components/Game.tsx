import { useSettings, defaultSettings } from './StartMenu'

const Game = () => {
    const back = () => useSettings.setState(defaultSettings)
    return (
        <div className='container'>
            공사중입니다. 조금만 기다려주세요.
            문의 : 김준영
            <div className='card cursor-pointer' onClick={back}>
                <p>뒤로 가기</p>
            </div>
        </div>
    )
}

export default Game
