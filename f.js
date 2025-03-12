const all_hiragana_map = {
    a: {
        a: {
            hiragana: 'あ',
            korean: '아',
            english: 'a',
            hint: '',
        },
        i: {
            hiragana: 'い',
            korean: '이',
            english: 'i',
            hint: '',
        },
        u: {
            hiragana: 'う',
            korean: '우',
            english: 'u',
            hint: '',
        },
        e: {
            hiragana: 'え',
            korean: '에',
            english: 'e',
            hint: '',
        },
        o: {
            hiragana: 'お',
            korean: '오',
            english: 'o',
            hint: '',
        },
    },
    ka: {
        ka: {
            hiragana: 'か',
            korean: '카',
            english: 'ka',
            hint: '',
        },
        ki: {
            hiragana: 'き',
            korean: '키',
            english: 'ki',
            hint: '',
        },
        ku: {
            hiragana: 'く',
            korean: '쿠',
            english: 'ku',
            hint: '',
        },
        ke: {
            hiragana: 'け',
            korean: '케',
            english: 'ke',
            hint: '',
        },
        ko: {
            hiragana: 'こ',
            korean: '코',
            english: 'ko',
            hint: '',
        },
    },
    sa: {
        sa: {
            hiragana: 'さ',
            korean: '사',
            english: 'sa',
            hint: '',
        },
        shi: {
            hiragana: 'し',
            korean: '시',
            english: 'shi',
            hint: '',
        },
        su: {
            hiragana: 'す',
            korean: '수',
            english: 'su',
            hint: '',
        },
        se: {
            hiragana: 'せ',
            korean: '세',
            english: 'se',
            hint: '',
        },
        so: {
            hiragana: 'そ',
            korean: '소',
            english: 'so',
            hint: '',
        },
    },
}

const hiragana_range = ['a', 'ka', 'sa']

const hiraganaMap = Object.keys(all_hiragana_map)
    .filter((key) => hiragana_range.includes(key))
    .reduce((obj, key) => {
        obj[key] = all_hiragana_map[key]
        return obj
    }, {})

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

console.log(extractHiragana(all_hiragana_map)) // ['あ', 'い', 'う', 'え', 'お']
console.log(getRandomHiragana())
