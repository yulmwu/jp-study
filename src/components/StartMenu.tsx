import React from 'react'
import { create } from 'zustand'

interface Settings {
    playing: boolean
    hiragana: Array<string>
    timer: boolean
    time: number
    nextNow: boolean
    particle: boolean
    message: boolean
}

const defaultSettings: Settings = {
    playing: false,
    hiragana: [],
    timer: false,
    time: 3,
    nextNow: false,
    particle: true,
    message: true,
}

const useSettings = create<Settings>((set) => defaultSettings)

const StartMenu = () => {
    const selectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
        const update = (checked: boolean) => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]')
            checkboxes.forEach((checkbox) => {
                const id = (checkbox as HTMLInputElement).id
                if (id in hiraganaMap) (checkbox as HTMLInputElement).checked = checked
            })
        }

        if (e.currentTarget.textContent === '전체 선택') {
            update(true)
            e.currentTarget.textContent = '전체 해제'
        } else {
            update(false)
            e.currentTarget.textContent = '전체 선택'
        }
    }

    const checkboxLabelChange = (e: React.ChangeEvent<HTMLInputElement>, text: string) => {
        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.textContent = text
    }

    const onTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeInput = document.getElementById('time') as HTMLInputElement
        if (e.currentTarget.checked) {
            timeInput.disabled = false
            checkboxLabelChange(e, '시간 제한 켬')
        } else {
            timeInput.disabled = true
            checkboxLabelChange(e, '시간 제한 끔')
        }
    }

    const onNextNowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.checked) {
            checkboxLabelChange(e, '정답 후 바로 넘어가기 켬')
        } else {
            checkboxLabelChange(e, '정답 후 바로 넘어가기 끔')
        }
    }

    const onParticleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.checked) {
            checkboxLabelChange(e, '파티클 효과 켬')
        } else {
            checkboxLabelChange(e, '파티클 효과 끔')
        }
    }

    const onMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.checked) {
            checkboxLabelChange(e, '정답/오답 문구 켬')
        } else {
            checkboxLabelChange(e, '정답/오답 문구 끔')
        }
    }

    const error = (message: string) => {
        const error = document.getElementById('error') as HTMLDivElement
        error.textContent = message
        error.classList.remove('hidden')
    }

    const updateSettings = (start: boolean) => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]')
        const selectedHiragana = Array.from(checkboxes)
            .filter((checkbox) => (checkbox as HTMLInputElement).checked)
            .map((checkbox) => (checkbox as HTMLInputElement).id)
            .filter((id) => id in hiraganaMap)

        if (selectedHiragana.length === 0) {
            error('히라가나 행을 선택하세요.')
            return
        }

        if (selectedHiragana.length === 1 && selectedHiragana[0] === 'wa') {
            error('wa(わ) 행은 단독으로 선택할 수 없습니다.')
            return
        }

        if (selectedHiragana.length === 1 && selectedHiragana[0] === 'ya') {
            error('ya(や) 행은 단독으로 선택할 수 없습니다.')
            return
        }

        const timer = (document.getElementById('timer') as HTMLInputElement).checked
        const time = parseInt((document.getElementById('time') as HTMLInputElement).value)

        const nextNow = (document.getElementById('nextnow') as HTMLInputElement).checked
        const particle = (document.getElementById('particle') as HTMLInputElement).checked
        const message = (document.getElementById('message') as HTMLInputElement).checked

        useSettings.setState({
            playing: start,
            hiragana: selectedHiragana,
            timer: timer,
            time,
            nextNow,
            particle,
            message,
        })
    }

    const startGame = () => updateSettings(true)

    const status = () => {
        updateSettings(false)
        const settings = useSettings.getState()
        alert(JSON.stringify(settings, null, 2))
    }

    return (
        <div className='container'>
            {/* 히라가나 선택 카드 */}
            <div className='card'>
                <h2 className='text-xl font-semibold text-center mb-4'>퀴즈의 히라가나 행을 선택하세요</h2>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                    {['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'].map((row) => (
                        <div key={row} className='flex items-center space-x-2'>
                            <input type='checkbox' id={row} className='w-4 h-4'></input>
                            <label htmlFor={row} className='text-gray-700 capitalize'>
                                {row} ({getHiragana(row)})
                            </label>
                        </div>
                    ))}
                </div>

                <div className='mt-6 flex justify-between'>
                    <button className='bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600' onClick={startGame}>
                        시작
                    </button>
                    <button className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-400' onClick={selectAll}>
                        전체 선택
                    </button>
                </div>

                <div
                    className='text-center text-red-600 hidden cursor-pointer'
                    id='error'
                    onClick={() => document.getElementById('error')?.classList.add('hidden')}
                ></div>
            </div>

            {/* 옵션 카드 */}
            <div className='card'>
                <h2 className='text-xl font-semibold text-center mb-4'>옵션 (선택)</h2>
                <p className='text-sm text-gray-600 text-center mb-4'>필요 시에만 선택하세요.</p>
                <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                        <input type='checkbox' id='timer' className='w-4 h-4' onChange={onTimerChange} />
                        <label htmlFor='timer' className='text-gray-700'>
                            시간 제한 끔
                        </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <input
                            type='text'
                            id='time'
                            className='border rounded-lg p-2 w-full disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed'
                            placeholder='시간 (초)'
                            defaultValue='3'
                            disabled
                        />
                    </div>
                    <div className='flex items-center space-x-2'>
                        <input type='checkbox' id='nextnow' className='w-4 h-4' onChange={onNextNowChange} />
                        <label htmlFor='nextnow' className='text-gray-700'>
                            정답 후 바로 넘어가기 끔
                        </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <input type='checkbox' id='particle' className='w-4 h-4' onChange={onParticleChange} defaultChecked />
                        <label htmlFor='particle' className='text-gray-700'>
                            파티클 효과 켬
                        </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <input type='checkbox' id='message' className='w-4 h-4' onChange={onMessageChange} defaultChecked />
                        <label htmlFor='message' className='text-gray-700'>
                            정답/오답 문구 켬
                        </label>
                    </div>
                </div>
            </div>

            {/* 개발 정보 */}
            <div className='text-center mt-6 text-gray-600'>
                <p>
                    개발 & 버그 제보:{' '}
                    <a href='https://github.com/yulmwu' className='text-blue-500 hover:underline'>
                        김준영
                    </a>
                </p>
                <p>데이터 제공: 윤선우</p>
                <p className='cursor-pointer' onClick={status}>
                    상태 확인
                </p>
            </div>
        </div>
    )
}

const hiraganaMap: Record<string, string> = {
    a: 'あ',
    ka: 'か',
    sa: 'さ',
    ta: 'た',
    na: 'な',
    ha: 'は',
    ma: 'ま',
    ya: 'や',
    ra: 'ら',
    wa: 'わ',
}

const getHiragana = (row: string) => hiraganaMap[row] ?? row

export default StartMenu
export { useSettings, defaultSettings }
