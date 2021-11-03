function jsonparse(str: string) {
  let i = 0
  let ch = str[i]

  // core function that revursively called to move forward scanning pointers and accept tokens
  function next(c?: string) {
    if (c) {
      if (str[i] === c) {
        i++
        ch = str[i]

        return true
      } else {
        throw new Error(`Error in parsing. '${c}' is expected at ${i}.`)
      }
    } else {
      i++
      ch = str[i]
    }
  }

  function colon() {
    next(':')
  }

  function leftBrace() {
    next('{')
  }

  function rightBrace() {
    next('}')
  }

  function leftBracket() {
    next('[')
  }

  function rightBracted() {
    next(']')
  }

  function quote() {
    next('"')
  }

  function comma() {
    next(',')
  }

  function dot() {
    next('.')
  }

  function _null() {
    next('n')
    next('u')
    next('l')
    next('l')
  }

  function _true() {
    next('t')
    next('r')
    next('u')
    next('e')
  }

  function _false() {
    next('f')
    next('a')
    next('l')
    next('s')
    next('e')
  }

  function sign() {
    if (ch && ch === '+') {
      next()

      return 1
    } else if (ch && ch === '-') {
      next()

      return -1
    }

    return 1
  }

  function expo() {
    if (ch && (ch === 'e' || ch === 'E')) {
      next()

      return 1
    }

    return 0
  }

  function word() {
    let parsed = ''

    while (ch && ch !== '"') {
      parsed += ch
      next()
    }

    return parsed
  }

  function digitSequence() {
    let seq = ''

    while (ch && /[0-9]/.test(ch)) {
      seq += ch
      next()
    }

    return parseInt(seq)
  }

  function number() {
    let parsed = 0
    let s = sign()
    let integer: undefined | number, fractional: undefined | number, exponential: undefined | number

    integer = digitSequence()

    if (ch && ch === '.') {
      dot()
      fractional = digitSequence()
    }

    const hasExpo = expo()

    if (hasExpo) {
      exponential = digitSequence()
    } else {
      exponential = 0
    }

    parsed = integer

    if (fractional) {
      parsed += fractional / Math.pow(10, fractional.toString().length)
    }

    if (exponential) {
      parsed = parsed * Math.pow(10, exponential)
    }

    if (s === -1) {
      parsed = -parsed
    }

    return parsed
  }

  function whitespace() {
    while (ch && /\s/.test(ch)) {
      next()
    }
  }

  function wordConstant() {
    let result: null | boolean

    if (ch && ch === 't') {
      _true()
      result = true
    } else if (ch && ch === 'f') {
      _false()
      result = false
    } else if (ch && ch === 'n') {
      _null()
      result = null
    }

    return result
  }

  function string() {
    quote()
    const parsed = word()
    quote()

    return parsed
  }

  function keyValue() {
    const result = []
    
    result[0] = string()
    whitespace()
    colon()
    whitespace()
    result[1] = element()

    return result
  }

  function keyValues() {
    const parsed = {}
    
    while(ch && ch === '"') {
      const [key, value] = keyValue()
      
      parsed[key] = value
      whitespace()

      if (ch && (ch as string) === ',') {
        comma()
      } else {
        break
      }

      whitespace()
    }

    return parsed
  }

  function element() {
    if (ch && ch === '"') {
      return string()
    } else if (ch && ch === '[') {
      return array()
    } else if (ch && ch === '{') {
      return object()
    } else if (ch && /[\+\-0-9]/.test(ch)) {
      return number()
    } else if (ch && /[tfn]/.test(ch)) {
      return wordConstant()
    } else {
      if (ch) {
        throw new Error(`Error in parsing. '${ch}' is invalid as an element in array at ${i}.`)
      }
    }
  }

  function elements() {
    const ele = []

    while (ch && /[\"\[\{\+\-0-9tfn]/.test(ch)) {
      const e = element()

      ele.push(e)
      whitespace()

      if (ch && ch === ',') {
        comma()
      } else {
        break
      }
      whitespace()
    }

    return ele
  }

  function array() {
    leftBracket()
    whitespace()
    const ele = elements()
    whitespace()
    rightBracted()

    return ele
  }

  function object() {
    leftBrace()
    whitespace()
    const obj = keyValues()
    whitespace()
    rightBrace()

    return obj
  }

  whitespace()
  const result = element()
  whitespace()

  return result
}
