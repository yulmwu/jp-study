const urlParams = new URLSearchParams(window.location.search)
const range = urlParams.get('r')
const duplicate = urlParams.get('d')


// settings
// const hiraganaRange = ['a', 'ka', 'sa']
const hiraganaRange = range ? range.split(',').map((r) => r.trim()) : ['a', 'ka', 'sa']
const duplicate_level = duplicate ? parseInt(duplicate) : 3

console.log(`hiraganaRange: ${hiraganaRange.join(' | ')}, duplicate_level: ${duplicate_level}`)

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
}

const messages = {
    correct: ['참 잘했어요~', '오빠 개멋있어', '이야.. 수준이 장난아니시네요!!!', '이정도면 얼 유 니혼진?', '일본 가서 뭐할려고 이렇게 잘하니?'],
    incorrect: ['엄마는 우리 아들 믿어~!', '넌 할 수 있어~!', '우리 아들 화이팅~!', '아깝다..', '이런..', '다음엔 꼭 맞춰보세요~'],
}

const resultLabel = document.getElementById('result')
const questionLabel = document.getElementById('question')
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

const randomMessage = (messages) => messages[Math.floor(Math.random() * messages.length)]

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

const checkAnswer = (selected, button) => {
    button.disabled = true

    if (selected === correctAnswer.english) {
        button.style.backgroundColor = 'lightgreen'
        resultLabel.innerText = `정답! 🎉\n${randomMessage(messages.correct)}`
        scoreUpdate(3)
        toggleButtons(true)

        setTimeout(() => {
            nextQuestion()
        }, 1500)
    } else {
        resultLabel.innerText = randomMessage(messages.incorrect)
        scoreUpdate(-1)

        button.style.backgroundColor = 'lightcoral'
    }
}

skipButton.onclick = () => {
    resultLabel.innerText = `정답은 ${questionLabel.innerText} 이였습니다.\n곧 다음 문제로 넘어갑니다.`
    toggleButtons(true)

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
