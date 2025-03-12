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

const resultLabel = document.getElementById('result')
const questionLabel = document.getElementById('question')
const skipButton = document.getElementById('skipButton')

const hiraganaRange = ['a', 'ka', 'sa']

const hiraganaMap = Object.keys(allHiraganaMap)
    .filter((key) => hiraganaRange.includes(key))
    .reduce((obj, key) => {
        obj[key] = allHiraganaMap[key]
        return obj
    }, {})

let correctAnswer = ''
let previousAnswers = [] // 5 questions

let score = 0
const scoreLabel = document.getElementById('score')

function scoreUpdate(n) {
    if (!n) score = 0
    score += n
    scoreLabel.innerText = score
}

function toggleButtons(state) {
    document.querySelectorAll('button').forEach((button) => {
        button.disabled = state
    })
}

function extractHiragana(obj) {
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

function getRandomHiragana() {
    const hiragana = extractHiragana(hiraganaMap)
    const randomIndex = Math.floor(Math.random() * hiragana.length)
    return hiragana[randomIndex]
}

function nextQuestion() {
    toggleButtons(false)

    resultLabel.innerText = ''

    const randomHiragana = getRandomHiragana()
    questionLabel.innerText = randomHiragana.hiragana

    if (previousAnswers.includes(randomHiragana)) {
        nextQuestion()
        return
    }

    previousAnswers.push(randomHiragana)

    if (previousAnswers.length > 3 * hiraganaRange.length) previousAnswers.shift()

    correctAnswer = randomHiragana
    generateOptions()
}

function generateOptions() {
    let options = [correctAnswer.english]
    while (options.length < 5) {
        let randomHiragana = getRandomHiragana()
        if (!options.includes(randomHiragana.english)) {
            options.push(randomHiragana.english)
        }
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

function checkAnswer(selected, button) {
    if (selected === correctAnswer.english) {
                button.style.backgroundColor = 'lightgreen'
        resultLabel.innerText = '정답! 🎉\n곧 다음 문제로 넘어갑니다.'
        scoreUpdate(3)
        toggleButtons(true)

        setTimeout(() => {
            nextQuestion()
        }, 1000)
    } else {
        resultLabel.innerText = '다시 시도해보세요~~'
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
