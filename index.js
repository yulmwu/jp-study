const urlParams = new URLSearchParams(window.location.search)
const range = urlParams.get('r')
const duplicate = urlParams.get('d')
const to = urlParams.get('to')
const ts = urlParams.get('ts')
const nn = urlParams.get('nn') // next now
const pt = urlParams.get('pt') // particle
const msg = urlParams.get('msg') // message

// settings
// const hiraganaRange = ['a', 'ka', 'sa']
const hiraganaRange = range ? range.split(',').map((r) => r.trim()) : ['a', 'ka', 'sa', 'ta', 'na']
const duplicate_level = duplicate ? parseInt(duplicate) : 4
const timer_on = to ? to === 'true' : false
const timer_seconds = ts ? parseInt(ts) : 3
const next_now = nn ? nn === 'true' : false
const particle = pt ? pt === 'true' : false
const message = msg ? msg === 'true' : false

console.log(`hiraganaRange: ${hiraganaRange.join(', ')}
duplicate_level: ${duplicate_level}
timer_on: ${timer_on}
timer_seconds: ${timer_seconds}
next_now: ${next_now}
particle: ${particle}
message: ${message}
`)

const allHiraganaMap = {
    a: {
        a: { hiragana: 'あ', korean: '아', english: 'a', hint: '' },
        i: { hiragana: 'い', korean: '이', english: 'i', hint: '' },
        u: { hiragana: 'う', korean: '우', english: 'u', hint: '' },
        e: { hiragana: 'え', korean: '에', english: 'e', hint: '' },
        o: { hiragana: 'お', korean: '오', english: 'o', hint: '' },
    },
    ka: {
        ka: { hiragana: 'か', korean: '카', english: 'ka', hint: '' },
        ki: { hiragana: 'き', korean: '키', english: 'ki', hint: '' },
        ku: { hiragana: 'く', korean: '쿠', english: 'ku', hint: '' },
        ke: { hiragana: 'け', korean: '케', english: 'ke', hint: '' },
        ko: { hiragana: 'こ', korean: '코', english: 'ko', hint: '' },
    },
    sa: {
        sa: { hiragana: 'さ', korean: '사', english: 'sa', hint: '' },
        shi: { hiragana: 'し', korean: '시', english: 'shi', hint: '' },
        su: { hiragana: 'す', korean: '수', english: 'su', hint: '' },
        se: { hiragana: 'せ', korean: '세', english: 'se', hint: '' },
        so: { hiragana: 'そ', korean: '소', english: 'so', hint: '' },
    },
    ta: {
        ta: { hiragana: 'た', korean: '타', english: 'ta', hint: '' },
        chi: { hiragana: 'ち', korean: '치', english: 'chi', hint: '' },
        tsu: { hiragana: 'つ', korean: '츠', english: 'tsu', hint: '' },
        te: { hiragana: 'て', korean: '테', english: 'te', hint: '' },
        to: { hiragana: 'と', korean: '토', english: 'to', hint: '' },
    },
    na: {
        na: { hiragana: 'な', korean: '나', english: 'na', hint: '' },
        ni: { hiragana: 'に', korean: '니', english: 'ni', hint: '' },
        nu: { hiragana: 'ぬ', korean: '누', english: 'nu', hint: '' },
        ne: { hiragana: 'ね', korean: '네', english: 'ne', hint: '' },
        no: { hiragana: 'の', korean: '노', english: 'no', hint: '' },
    },
    ha: {
        ha: { hiragana: 'は', korean: '하', english: 'ha', hint: '' },
        hi: { hiragana: 'ひ', korean: '히', english: 'hi', hint: '' },
        fu: { hiragana: 'ふ', korean: '후', english: 'fu', hint: '' },
        he: { hiragana: 'へ', korean: '헤', english: 'he', hint: '' },
        ho: { hiragana: 'ほ', korean: '호', english: 'ho', hint: '' },
    },
    ma: {
        ma: { hiragana: 'ま', korean: '마', english: 'ma', hint: '' },
        mi: { hiragana: 'み', korean: '미', english: 'mi', hint: '' },
        mu: { hiragana: 'む', korean: '무', english: 'mu', hint: '' },
        me: { hiragana: 'め', korean: '메', english: 'me', hint: '' },
        mo: { hiragana: 'も', korean: '모', english: 'mo', hint: '' },
    },
    ya: {
        ya: { hiragana: 'や', korean: '야', english: 'ya', hint: '' },
        yu: { hiragana: 'ゆ', korean: '유', english: 'yu', hint: '' },
        yo: { hiragana: 'よ', korean: '요', english: 'yo', hint: '' },
    },
    ra: {
        ra: { hiragana: 'ら', korean: '라', english: 'ra', hint: '' },
        ri: { hiragana: 'り', korean: '리', english: 'ri', hint: '' },
        ru: { hiragana: 'る', korean: '루', english: 'ru', hint: '' },
        re: { hiragana: 'れ', korean: '레', english: 're', hint: '' },
        ro: { hiragana: 'ろ', korean: '로', english: 'ro', hint: '' },
    },
    wa: {
        wa: { hiragana: 'わ', korean: '와', english: 'wa', hint: '' },
        wo: { hiragana: 'を', korean: '오', english: 'wo', hint: '' },
        n: { hiragana: 'ん', korean: '응', english: 'n', hint: '' },
    },
}

const messages = {
    correct: ['참 잘했어요~', '오빠 개멋있어', '이야.. 수준이 장난아니시네요!!!', '이정도면 얼 유 니혼진?', '일본 가서 뭐할려고 이렇게 잘하니?'],
    incorrect: ['엄마는 우리 아들 믿어~!', '넌 할 수 있어~!', '우리 아들 화이팅~!', '아깝다..', '이런..', '다음엔 꼭 맞춰보세요~'],
}

const resultLabel = document.getElementById('result')
const questionLabel = document.getElementById('question')
const timerLabel = document.getElementById('timer')
const skipButton = document.getElementById('skipButton')

const hiraganaMap = Object.keys(allHiraganaMap)
    .filter((key) => hiraganaRange.includes(key))
    .reduce((obj, key) => {
        obj[key] = allHiraganaMap[key]
        return obj
    }, {})

let correctAnswer = ''
let previousAnswers = []

let score = 0
const scoreLabel = document.getElementById('score')

const scoreUpdate = (n) => {
    if (!n) score = 0
    score += n
    scoreLabel.innerText = score
}

let timer = timer_seconds
let seconds = 0
let isRunning = false

const updateDisplay = () => {
    if (timer_on) timerLabel.innerText = `시간 제한: ${seconds}초 남음`
    else timerLabel.innerText = ''

    if (seconds <= 3) updateTimerColor('red')
    else updateTimerColor('black')
}

const updateTimerColor = (color) => {
    if (timer_on) timerLabel.style.color = color
}

const startTimer = (timeout) => {
    if (!isRunning) {
        isRunning = true
        timer = setInterval(() => {
            if (seconds <= 1) {
                stopTimer()
                resetTimer()
                timeout()
                return
            }

            seconds--
            updateDisplay()
        }, 1000)
    }
}

const stopTimer = () => {
    clearInterval(timer)
    isRunning = false
    updateTimerColor('blue')
}

const resetTimer = () => {
    stopTimer()
    seconds = timer_seconds
    updateDisplay()
}

const randomMessage = (messages) => {
    if (!message) return ''
    return messages[Math.floor(Math.random() * messages.length)]
}

const toggleButtons = (state) => document.querySelectorAll('button').forEach((button) => (button.disabled = state))

const extractHiragana = (obj) => {
    let result = []

    for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
            result = result.concat(extractHiragana(value))
        } else if (obj.hiragana) {
            result.push(obj)
            break
        }
    }
    return result
}

const getRandomHiragana = () => {
    const hiragana = extractHiragana(hiraganaMap)
    const randomIndex = Math.floor(Math.random() * hiragana.length)
    return hiragana[randomIndex]
}

const nextQuestion = () => {
    toggleButtons(false)
    resetTimer()
    if (timer_on)
        startTimer(() => {
            resultLabel.innerText = `시간 초과! 정답은 ${correctAnswer.english} 이였습니다.\n곧 다음 문제로 넘어갑니다.`
            updateTimerColor('blue')

            toggleButtons(true)

            scoreUpdate(-5)

            document.querySelectorAll('button').forEach((button) => {
                if (button.innerText === correctAnswer.english) {
                    button.style.backgroundColor = 'lightgreen'
                }
            })

            setTimeout(() => {
                nextQuestion()
            }, 1500)
            return
        })

    resultLabel.innerText = ''

    const randomHiragana = getRandomHiragana()
    questionLabel.innerText = randomHiragana.hiragana

    if (previousAnswers.includes(randomHiragana)) {
        nextQuestion()
        return
    }

    previousAnswers.push(randomHiragana)

    if (previousAnswers.length > duplicate_level * hiraganaRange.length) previousAnswers.shift()

    correctAnswer = randomHiragana
    generateOptions()
}

const generateOptions = () => {
    let options = [correctAnswer.english]
    while (options.length < 5) {
        let randomHiragana = getRandomHiragana()

        if (!options.includes(randomHiragana.english)) options.push(randomHiragana.english)
    }
    options.sort(() => Math.random() - 0.5)

    let optionsContainer = document.getElementById('options')
    optionsContainer.innerHTML = ''

    options.forEach((option) => {
        let button = document.createElement('button')
        button.innerText = option
        button.onclick = () => checkAnswer(option, button)
        optionsContainer.appendChild(button)
    })
}

const createFirework = (x, y) => {
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

const checkAnswer = (selected, button) => {
    button.disabled = true

    if (selected === correctAnswer.english) {
        if (next_now) {
            nextQuestion()
            return
        }

        button.style.backgroundColor = 'lightgreen'
        resultLabel.innerText = `정답! 🎉\n${randomMessage(messages.correct)}`
        scoreUpdate(3)
        toggleButtons(true)
        stopTimer()

        if (particle) {
            const rect = button.getBoundingClientRect()
            createFirework(rect.left + rect.width / 2, rect.top + rect.height / 2)
        }

        setTimeout(() => {
            nextQuestion()
        }, 1300)
    } else {
        resultLabel.innerText = randomMessage(messages.incorrect)
        scoreUpdate(-1)

        button.style.backgroundColor = 'lightcoral'
    }
}

skipButton.onclick = () => {
    resultLabel.innerText = `정답은 ${correctAnswer.english} 이였습니다.\n곧 다음 문제로 넘어갑니다.`
    toggleButtons(true)
    stopTimer()

    scoreUpdate(-2)

    document.querySelectorAll('button').forEach((button) => {
        if (button.innerText === correctAnswer.english) {
            button.style.backgroundColor = 'lightgreen'
        }
    })

    setTimeout(() => {
        nextQuestion()
    }, 1500)
}

nextQuestion()
