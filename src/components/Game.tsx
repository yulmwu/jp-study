import { useRef, useEffect } from 'react'
import { useSettings } from './StartMenu'
import FooterCard from './FooterCard'

import _allHiraganaMap from '../data/hiragana.json'
import messageMap from '../data/message.json'

const allHiraganaMap = _allHiraganaMap as HiraganaMapInterface

interface HiraganaMapInterface {
    [column: string]: {
        [row: string]: Hiragana
    }
}

interface Hiragana {
    hiragana: string
    korean: string
    romaji: string
}

const createFirework = (x: number, y: number) => {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')
        document.body.appendChild(particle)

        const angle = Math.random() * 2 * Math.PI
        const distance = Math.random() * 100 + 50
        const xOffset = Math.cos(angle) * distance + 'px'
        const yOffset = Math.sin(angle) * distance + 'px'

        particle.style.setProperty('--x', xOffset)
        particle.style.setProperty('--y', yOffset)
        particle.style.left = x + 'px'
        particle.style.top = y + 'px'
        particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`

        setTimeout(() => particle.remove(), 1300)
    }
}

const Game = () => {
    let { playing, score, hiraganaRange, timer: is_timer_on, time: timer_secs, nextNow, particle, message, duplevel } = useSettings((state) => state)

    const scoreRef = useRef<HTMLHeadingElement>(null)
    const questionRef = useRef<HTMLHeadingElement>(null)
    const resultRef = useRef<HTMLParagraphElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<HTMLDivElement>(null)

    let correctAnswer: Hiragana = { hiragana: '', korean: '', romaji: '' }
    let previousAnswers: Array<Hiragana> = []

    let timer: NodeJS.Timeout
    let seconds = 0
    let timer_running = false

    const updateTimerDisplay = () => {
        if (is_timer_on) timerRef.current!.innerText = `시간 제한: ${seconds}`
        else timerRef.current!.innerText = ''

        if (seconds <= 3) updateTimerColor('red')
        else updateTimerColor('black')
    }

    const updateTimerColor = (color: string) => {
        if (is_timer_on) timerRef.current!.style.color = color
    }

    const startTimer = (timeout: any) => {
        if (timer_running) return

        timer_running = true
        timer = setInterval(() => {
            if (seconds <= 1) {
                stopTimer()
                resetTimer()
                timeout()
                return
            }

            seconds--
            updateTimerDisplay()
        }, 1000)
    }

    const stopTimer = () => {
        clearInterval(timer)
        timer_running = false
        updateTimerColor('blue')
    }

    const resetTimer = () => {
        stopTimer()
        seconds = timer_secs
        updateTimerDisplay()
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

    const scoreUpdate = (n?: number) => {
        if (!n) score = 0
        else score += n
        scoreRef.current!.innerText = `Score: ${score}`
    }

    const toggleButtons = (state: boolean) => {
        const options = optionsRef.current

        if (options) {
            const buttons = options.querySelectorAll('button')
            buttons.forEach((button) => {
                button.disabled = state
            })
        }
    }

    const randomHiragana = (): Hiragana => {
        const randomIndex = Math.floor(Math.random() * extractedHiragana.length)
        return extractedHiragana[randomIndex]
    }

    const nextQuestion = () => {
        if (!playing) return

        toggleButtons(false)
        resetTimer()

        if (is_timer_on)
            startTimer(() => {
                resultRef.current!.innerText = `시간 초과! 정답은 ${correctAnswer.romaji} 이였습니다.\n곧 다음 문제로 넘어갑니다.`
                updateTimerColor('blue')

                toggleButtons(true)

                scoreUpdate(-5)

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

        resultRef.current!.innerText = ''

        const question = randomHiragana()
        questionRef.current!.innerText = question.hiragana

        console.log(previousAnswers)

        if (previousAnswers.includes(question)) {
            nextQuestion()
            return
        }

        previousAnswers.push(question)

        if (previousAnswers.length > duplevel * hiraganaRange.length) previousAnswers.shift()

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
                    'cursor-pointer'
                )

                optionsElement.appendChild(button)
            })
        }
    }

    const checkAnswer = (option: Hiragana, button: HTMLButtonElement) => {
        button.disabled = true

        if (option === correctAnswer) {
            button.classList.add('correct')
            scoreUpdate(3)
            toggleButtons(true)
            stopTimer()

            if (message) resultRef.current!.innerText = `정답! 🎉\n${randomMessage(messageMap.correct)}`

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
            button.classList.add('incorrect')
            if (message) resultRef.current!.innerText = randomMessage(messageMap.incorrect)
            scoreUpdate(-1)
        }
    }

    useEffect(() => {
        if (playing) {
            scoreUpdate()
            nextQuestion()
        }
    })

    return (
        <div className='container'>
            <div className='card'>
                <p id='score' className='text-2xl text-center pb-3' ref={scoreRef}>
                    Score: 0
                </p>
                <p id='timer' className='text-1.5xl text-center pb-3' ref={timerRef}>
                    시간 제한: 0
                </p>
                <p id='question' className='text-6xl text-center' ref={questionRef}>
                    ?
                </p>
                <p id='result' className='text-center pt-3' ref={resultRef}></p>
            </div>

            <div className='card'>
                {/* options */}
                <div id='options' className='flex justify-center flex-wrap gap-5' ref={optionsRef}></div>
            </div>

            <FooterCard />

            <div className='flex justify-center mt-20'>
                {/* <button className='bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600' onClick={back}>
                    처음으로 돌아가기
                </button> */}
            </div>
        </div>
    )
}

export default Game
