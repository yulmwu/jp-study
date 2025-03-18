import React, { useRef, useEffect } from 'react'
import { useSettings, defaultSettings } from './StartMenu'
import hiraganaMapDefault from '../data/hiragana.json'
import messageMap from '../data/message.json'

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

const hiraganaMap: HiraganaMapInterface = hiraganaMapDefault

// HiraganaMapInterface to Hiragana[]
const extractHiragana = (obj: HiraganaMapInterface): Hiragana[] => {
    const hiragana: Hiragana[] = []
    for (const column in obj) {
        for (const row in obj[column]) {
            hiragana.push(obj[column][row])
        }
    }
    return hiragana
}

const extractedHiragana = extractHiragana(hiraganaMap)

const randomMessage = (messages: string[]): string => {
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
}

const Game = () => {
    let { playing, score, hiraganaRange, timer, time, nextNow, particle, message, duplevel } = useSettings((state) => state)
    const scoreRef = useRef<HTMLHeadingElement>(null)
    const questionRef = useRef<HTMLHeadingElement>(null)
    const resultRef = useRef<HTMLParagraphElement>(null)

    let correctAnswer: Hiragana = { hiragana: '', korean: '', romaji: '' }
    let previousAnswers: Array<Hiragana> = []

    const scoreUpdate = (n?: number) => {
        if (!n) score = 0
        else score += n
        scoreRef.current!.innerText = `Score: ${score}`
    }

    const toggleButtons = (state: boolean) => {
        const options = document.getElementById('options')
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
        toggleButtons(false)
        resultRef.current!.innerText = ''

        const question = randomHiragana()

        if (previousAnswers.includes(correctAnswer)) {
            nextQuestion()
            return
        }

        previousAnswers.push(correctAnswer)

        correctAnswer = question
        questionRef.current!.innerText = question.hiragana

        generateOptions()
    }

    const generateOptions = () => {
        const options = [correctAnswer]

        while (options.length < 5) {
            const option = randomHiragana()
            if (!options.includes(option)) options.push(option)
        }

        options.sort(() => Math.random() - 0.5)

        const optionsElement = document.getElementById('options')
        if (optionsElement) {
            optionsElement.innerHTML = ''
            options.forEach((option) => {
                const button = document.createElement('button')
                button.innerText = `${option.korean} (${option.romaji})`
                button.addEventListener('click', () => checkAnswer(option, button))

                // button style with tailwindcss
                button.classList.add(
                    'p-2',
                    'bg-gray-100',
                    'text-black',
                    'rounded',
                    'hover:bg-gray-200',
                    'focus:outline-none',
                    'w-20',
                    'h-20',
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
            resultRef.current!.innerText = `정답! 🎉\n${randomMessage(messageMap.correct)}`
            scoreUpdate(3)
            toggleButtons(true)
            setTimeout(() => {
                nextQuestion()
            }, 1000)
        } else {
            button.classList.add('incorrect')
            resultRef.current!.innerText = randomMessage(messageMap.incorrect)
            scoreUpdate(-1)
        }
    }

    const back = () => useSettings.setState(defaultSettings)

    useEffect(() => {
        if (playing) {
            scoreUpdate()
            nextQuestion()
        }
    })

    return (
        //     <div class="quiz-container">
        //     <h2 id="score">Score: 0</h2>
        //     <h1 id="question">?</h1>
        //     <h4 id="timer">시간 제한: 없음</h4>
        //     <div class="options" id="options"></div>
        //     <p id="result"></p>
        //     <button class="next" id="skipButton">건너뛰기</button>
        // </div>
        // <div class="footer2">
        //     <a href="index.html">처음으로 돌아가기 (클릭)</a>
        // </div>

        <div className='container'>
            <div className='card'>
                <p id='score' className='text-2xl text-center pb-3' ref={scoreRef}>
                    Score: 0
                </p>
                <p id='question' className='text-6xl text-center' ref={questionRef}>
                    ?
                </p>
                <p id='result' className='text-center' ref={resultRef}></p>
            </div>

            <div className='card'>
                {/* options */}
                <div id='options' className='flex justify-center flex-wrap gap-5'></div>
            </div>
        </div>
    )
}

export default Game
