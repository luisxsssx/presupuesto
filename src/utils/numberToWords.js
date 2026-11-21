const UNIDADES = [
  '',
  'un',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
]

const DECENAS = [
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
]

const DECENAS_MULTIPLOS = [
  '',
  '',
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
]

const CENTENAS = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos',
]

function convertHundreds(n) {
  // n entre 0 y 999
  const c = Math.floor(n / 100)
  const r = n % 100
  let result = ''

  if (c > 0) {
    if (c === 1 && r === 0) {
      result = 'cien'
    } else {
      result = CENTENAS[c]
    }
  }

  if (r > 0) {
    if (result) result += ' '

    if (r < 10) {
      result += UNIDADES[r]
    } else if (r >= 10 && r <= 19) {
      result += DECENAS[r - 10]
    } else {
      const d = Math.floor(r / 10)
      const u = r % 10

      if (d === 2) {
        const especiales = [
          '',
          'veintiuno',
          'veintidós',
          'veintitrés',
          'veinticuatro',
          'veinticinco',
          'veintiséis',
          'veintisiete',
          'veintiocho',
          'veintinueve',
        ]
        result += u > 0 ? especiales[u] : 'veinte'
      } else {
        result += DECENAS_MULTIPLOS[d]
        if (u > 0) {
          result += ' y ' + UNIDADES[u]
        }
      }
    }
  }

  return result
}

export function numberToWords(amount) {
  const num = Math.round(parseFloat(String(amount ?? '0')) * 100) / 100
  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)

  if (integerPart === 0) {
    const decStr = decimalPart < 10 ? '0' + String(decimalPart) : String(decimalPart)
    return 'Cero con ' + decStr + '/100'
  }

  // Dividir el entero en grupos de 3 dígitos (unidades, miles, millones, ...)
  const grupos = []
  let n = integerPart
  while (n > 0) {
    grupos.unshift(n % 1000)
    n = Math.floor(n / 1000)
  }

  const parts = []

  for (let i = 0; i < grupos.length; i += 1) {
    const grupo = grupos[i]
    if (grupo === 0) continue

    // Índice del grupo: 0 = unidades, 1 = miles, 2 = millones, 3 = miles de millones
    const grupoIndex = grupos.length - 1 - i
    let grupoTexto = convertHundreds(grupo)

    if (grupoIndex === 1) {
      // Miles
      grupoTexto = grupo === 1 ? 'mil' : grupoTexto + ' mil'
    } else if (grupoIndex === 2) {
      // Millones
      grupoTexto = grupo === 1 ? 'un millón' : grupoTexto + ' millones'
    } else if (grupoIndex === 3) {
      // Miles de millones
      grupoTexto = grupo === 1 ? 'mil millones' : grupoTexto + ' mil millones'
    }

    parts.push(grupoTexto)
  }

  let words = parts.join(' ')

  const decStr = decimalPart < 10 ? '0' + String(decimalPart) : String(decimalPart)
  words += ' con ' + decStr + '/100'

  return words.charAt(0).toUpperCase() + words.slice(1)
}
