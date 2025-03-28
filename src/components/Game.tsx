import { useRef, useEffect } from 'react'
import { useSettings } from './StartMenu'
import FooterCard from './FooterCard'

import _allHiraganaMap from '../data/hiragana.json'
import _hiraganaStrokeImageMap from '../data/hiragana_stroke.json'
import MessageMap from '../data/message.json'
import Settings from '../data/settings.json'

import createFirework from '../utils/firework'

interface HiraganaMapInterface {
    [column: string]: {
        [row: string]: Hiragana
    }
}

interface Hiragana {
    hiragana: string
    korean: string
    romaji: string
    hint?: string
}

interface HiraganaStrokeImageMapInterface {
    [hiragana: string]: string
}

const allHiraganaMap = _allHiraganaMap as HiraganaMapInterface
const HiraganaStrokeImageMap = _hiraganaStrokeImageMap as HiraganaStrokeImageMapInterface

const Game = () => {
    let {
        playing,
        score,
        hiraganaRange,
        timer: timerSecs,
        timeRemaining: timeRemainingSecs,
        nextNow,
        particle,
        message,
        strokeImage,
        font,
        duplevel,
        correctCount,
        incorrectCount,
        showCorrectRate,
    } = useSettings((state) => state)

    const scoreRef = useRef<HTMLHeadingElement>(null)
    const questionRef = useRef<HTMLHeadingElement>(null)
    const questionImageRef = useRef<HTMLImageElement>(null)
    const resultRef = useRef<HTMLParagraphElement>(null)
    const hintMessageRef = useRef<HTMLParagraphElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<HTMLDivElement>(null)
    const timeRemainingRef = useRef<HTMLDivElement>(null)
    const hintRef = useRef<HTMLButtonElement>(null)
    const skipRef = useRef<HTMLButtonElement>(null)

    let correctAnswer: Hiragana = { hiragana: '', korean: '', romaji: '' }
    let previousAnswers: Array<Hiragana> = []

    let timer: NodeJS.Timeout
    let timerCurrent = 0
    let timerRunning = false

    let timeRemainingTimer: NodeJS.Timeout
    let timeRemainingCurrent = 0
    let timeRemainingRunning = false

    // --- Timer ---
    const updateTimerDisplay = () => {
        if (timerSecs) timerRef.current!.innerText = `시간 제한: ${timerCurrent}`
        else timerRef.current!.innerText = ''

        if (timerCurrent <= 3) updateTimerColor('red')
        else updateTimerColor('black')
    }

    const updateTimerColor = (color: string) => {
        if (timerSecs) timerRef.current!.style.color = color
    }

    const startTimer = (timeout: any) => {
        if (timerRunning) return

        timerRunning = true
        timer = setInterval(() => {
            if (timerCurrent <= 1) {
                stopTimer()
                resetTimer()
                timeout()
                return
            }

            timerCurrent--
            updateTimerDisplay()
        }, 1000)
    }

    const stopTimer = () => {
        clearInterval(timer)
        timerRunning = false
        updateTimerColor('blue')
    }

    const resetTimer = () => {
        stopTimer()
        timerCurrent = timerSecs ?? 0
        updateTimerDisplay()
    }

    // --- Time Remaining ---
    const updateTimeRemainingDisplay = () => {
        if (timeRemainingSecs) timeRemainingRef.current!.innerText = `남은 시간: ${timeRemainingCurrent}`
        else timeRemainingRef.current!.innerText = ''

        if (timeRemainingCurrent <= 3) updateTimeRemainingColor('red')
        else updateTimeRemainingColor('black')
    }

    const updateTimeRemainingColor = (color: string) => {
        if (timeRemainingSecs) timeRemainingRef.current!.style.color = color
    }

    const startTimeRemaining = (timeout: any) => {
        if (timeRemainingRunning) return

        timeRemainingRunning = true
        timeRemainingTimer = setInterval(() => {
            if (timeRemainingCurrent <= 1) {
                stopTimeRemaining()
                resetTimeRemaining()
                timeout()
                return
            }

            timeRemainingCurrent--
            updateTimeRemainingDisplay()
        }, 1000)
    }

    const stopTimeRemaining = () => {
        clearInterval(timeRemainingTimer)
        timeRemainingRunning = false
        updateTimeRemainingColor('blue')
    }

    const resetTimeRemaining = () => {
        stopTimeRemaining()
        timeRemainingCurrent = timeRemainingSecs ?? 0
        updateTimeRemainingDisplay()
    }

    const hiraganaMap: HiraganaMapInterface = {}
    hiraganaRange.forEach((column) => {
        hiraganaMap[column] = allHiraganaMap[column]
    })

    // HiraganaMapInterface to Hiragana[]
    const extractHiragana = (obj: HiraganaMapInterface): Array<Hiragana> => {
        const hiragana: Array<Hiragana> = []
        for (const column in obj) {
            for (const row in obj[column]) {
                hiragana.push(obj[column][row])
            }
        }
        return hiragana
    }

    const extractedHiragana = extractHiragana(hiraganaMap)

    const randomMessage = (messages: Array<string>): string => {
        const randomIndex = Math.floor(Math.random() * messages.length)
        return messages[randomIndex]
    }

    const calcCorrectRate = (): number => {
        if (correctCount + incorrectCount === 0) return 0
        return Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    }

    const scoreUpdate = (n?: number) => {
        if (!n) score = Settings.score_const.default
        else score += n

        scoreRef.current!.innerText = `점수: ${score} ${showCorrectRate ? `(정답률: ${calcCorrectRate()}%)` : ''}`
    }

    const toggleButtons = (state: boolean) => {
        const options = optionsRef.current

        if (options) {
            const buttons = options.querySelectorAll('button')
            buttons.forEach((button) => {
                button.disabled = state
            })
        }

        skipRef.current!.disabled = state
        hintRef.current!.disabled = state
    }

    const randomHiragana = (): Hiragana => {
        const randomIndex = Math.floor(Math.random() * extractedHiragana.length)
        return extractedHiragana[randomIndex]
    }

    const nextQuestion = () => {
        if (!playing) return

        toggleButtons(false)
        resetTimer()

        resultRef.current!.innerText = ''
        hintMessageRef.current!.innerText = ''

        if (timerSecs)
            startTimer(() => {
                incorrectCount++
                resultRef.current!.innerText = `시간 초과! 정답은 ${correctAnswer.romaji} 이였습니다.\n곧 다음 문제로 넘어갑니다.`
                updateTimerColor('blue')

                toggleButtons(true)

                scoreUpdate(Settings.score_const.timeout)

                document.querySelectorAll('button').forEach((button) => {
                    if (button.innerText.includes(correctAnswer.romaji)) {
                        button.classList.add('correct')
                    }
                })

                setTimeout(() => {
                    nextQuestion()
                }, 1500)
                return
            })

        const question = randomHiragana()

        if (previousAnswers.includes(question)) {
            nextQuestion()
            return
        }

        previousAnswers.push(question)

        if (previousAnswers.length > duplevel * hiraganaRange.length) previousAnswers.shift()

        questionRef.current!.innerText = question.hiragana
        if (strokeImage) questionImageRef.current!.src = HiraganaStrokeImageMap[question.hiragana]

        if (!question.hint) hintRef.current!.disabled = true

        correctAnswer = question

        generateOptions()
    }

    const generateOptions = () => {
        const options = [correctAnswer]

        while (options.length < 5) {
            const option = randomHiragana()
            if (!options.includes(option)) options.push(option)
        }

        options.sort(() => Math.random() - 0.5)

        const optionsElement = optionsRef.current
        if (optionsElement) {
            optionsElement.innerHTML = ''
            options.forEach((option) => {
                const button = document.createElement('button')
                button.innerHTML = `<b>${option.korean}</b><br />${option.romaji}`
                button.addEventListener('click', () => checkAnswer(option, button))

                // button style with tailwindcss
                button.classList.add(
                    'p-2',
                    'bg-gray-100',
                    'text-black',
                    'rounded-xl',
                    'hover:bg-gray-200',
                    'focus:outline-none',
                    'w-17',
                    'h-17',
                    'cursor-pointer',
                    'options-btn'
                )

                optionsElement.appendChild(button)
            })
        }
    }

    const checkAnswer = (option: Hiragana, button: HTMLButtonElement) => {
        button.disabled = true

        if (option === correctAnswer) {
            button.classList.add('correct')
            scoreUpdate(Settings.score_const.correct)
            toggleButtons(true)
            stopTimer()

            if (message) resultRef.current!.innerText = `정답! 🎉\n${randomMessage(MessageMap.correct)}`
            correctCount++

            if (nextNow) {
                setTimeout(() => {
                    nextQuestion()
                }, 300)

                return
            }

            if (particle) {
                const rect = button.getBoundingClientRect()
                createFirework(rect.left + rect.width / 2, rect.top + rect.height / 2)
            }

            setTimeout(() => {
                nextQuestion()
            }, 1000)
        } else {
            button.classList.add('incorrect', 'incorrect-animation')
            if (message) resultRef.current!.innerText = randomMessage(MessageMap.incorrect)
            scoreUpdate(Settings.score_const.incorrect)
            incorrectCount++
        }
    }

    const skip = () => {
        incorrectCount++
        resultRef.current!.innerHTML = `정답은 <b class='text-blue-500'>${correctAnswer.romaji}</b> 이였습니다.<br />곧 다음 문제로 넘어갑니다.`
        toggleButtons(true)
        stopTimer()

        scoreUpdate(Settings.score_const.skip)

        document.querySelectorAll('button').forEach((button) => {
            if (button.innerText.includes(correctAnswer.romaji)) {
                button.classList.add('correct')
            }
        })

        setTimeout(() => {
            nextQuestion()
        }, 1500)
    }

    const hint = () => {
        hintRef.current!.disabled = true
        if (correctAnswer.hint) hintMessageRef.current!.innerHTML = `<b class='text-blue-500'>힌트:</b> ${correctAnswer.hint}`
        scoreUpdate(Settings.score_const.hint)
    }

    useEffect(() => {
        if (playing) {
            scoreUpdate()
            nextQuestion()

            if (timeRemainingSecs) {
                resetTimeRemaining()
                startTimeRemaining(() => {
                    stopTimer()
                    stopTimeRemaining()
                    toggleButtons(true)

                    alert(`시간 초과!

점수: ${score}

정답 수: ${correctCount}
오답 수: ${incorrectCount}
정답률: ${calcCorrectRate()}%

설정 시간: ${timeRemainingSecs}초
범위: ${hiraganaRange.join(', ')}

"확인" 버튼 클릭 시 처음 화면으로 돌아갑니다.`)

                    window.location.reload()
                })
            }
        }

        // document.addEventListener('keydown', (e) => {
        //     const key = e.key.toLowerCase()

        //     switch (key) {
        //         case Settings.keybinds.skip:
        //             skip()
        //             break
        //         case Settings.keybinds.hint:
        //             hint()
        //             break
        //         case Settings.keybinds.option1:
        //             checkAnswer(correctAnswer, document.querySelectorAll('button')[0] as HTMLButtonElement)
        //             break
        //         case Settings.keybinds.option2:
        //             checkAnswer(correctAnswer, document.querySelectorAll('button')[1] as HTMLButtonElement)
        //             break
        //         case Settings.keybinds.option3:
        //             checkAnswer(correctAnswer, document.querySelectorAll('button')[2] as HTMLButtonElement)
        //             break
        //         case Settings.keybinds.option4:
        //             checkAnswer(correctAnswer, document.querySelectorAll('button')[3] as HTMLButtonElement)
        //             break
        //         case Settings.keybinds.option5:
        //             checkAnswer(correctAnswer, document.querySelectorAll('button')[4] as HTMLButtonElement)
        //             break
        //         default:
        //             break
        //     }
        // })
    })

    return (
        <div className='container'>
            <div className='card'>
                <p id='score' className='text-2xl text-center pb-3' ref={scoreRef}>
                    점수: 0 {showCorrectRate ? '(정답률: 0%)' : ''}
                </p>
                <p id='timer' className='text-1.5xl text-center pb-3' ref={timerRef}>
                    시간 제한: 0
                </p>
                <p id='timerRemaining' className='text-1.5xl text-center pb-3' ref={timeRemainingRef}>
                    남은 시간: 0
                </p>
                <div>
                    <p id='question' className={`text-6xl text-center font-${font}`} ref={questionRef}>
                        ?
                    </p>
                    {/* <img id='questionImage' className='w-15 mx-auto mt-5'
                    ref={questionImageRef} alt='question' /> */}
                    {strokeImage ? <img id='questionImage' className='w-15 mx-auto mt-5' ref={questionImageRef} alt='question' /> : null}
                </div>
                <p id='result' className='text-center pt-3' ref={resultRef}></p>
                <p id='hintmessage' className='text-center pt-3' ref={hintMessageRef}></p>
            </div>

            <div className='card'>
                {/* options */}
                <div id='options' className='flex justify-center flex-wrap gap-5' ref={optionsRef}></div>

                <div className='flex justify-center gap-5 mt-10'>
                    <button className='bg-red-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500' onClick={hint} ref={hintRef}>
                        힌트보기 ({Settings.score_const.hint}점)
                    </button>
                    <button className='bg-red-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500' onClick={skip} ref={skipRef}>
                        스킵하기 ({Settings.score_const.skip}점)
                    </button>
                </div>
            </div>

            <FooterCard />

            <div className='flex justify-center mt-20'>
                <button className='bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600' onClick={() => window.location.reload()}>
                    처음으로 돌아가기
                </button>
            </div>
        </div>
    )
}

export default Game
