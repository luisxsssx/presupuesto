import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MANROPE_400, MANROPE_600, MANROPE_700 } from './pdfFonts.js'

const FONT = 'Manrope'

const COLORS = {
  ink: [24, 24, 27],
  muted: [113, 113, 122],
  faint: [161, 161, 170],
  rule: [231, 231, 227],
  softRule: [239, 239, 236],
  green: [56, 102, 65],
  dark: [17, 17, 17],
  card: [250, 250, 249],
  altRow: [250, 250, 249],
  white: [255, 255, 255],
}

const registerFonts = (doc) => {
  doc.addFileToVFS('Manrope-Regular.ttf', MANROPE_400)
  doc.addFont('Manrope-Regular.ttf', FONT, 'normal')

  doc.addFileToVFS('Manrope-SemiBold.ttf', MANROPE_600)
  doc.addFont('Manrope-SemiBold.ttf', FONT, '600normal')

  doc.addFileToVFS('Manrope-Bold.ttf', MANROPE_700)
  doc.addFont('Manrope-Bold.ttf', FONT, 'bold')
}

const setText = (doc, size, weight = 400, color = COLORS.ink) => {
  if (weight >= 700) {
    doc.setFont(FONT, 'bold')
  } else if (weight === 600) {
    doc.setFont(FONT, 'normal', 600)
  } else {
    doc.setFont(FONT, 'normal')
  }

  doc.setFontSize(size)
  doc.setTextColor(...color)
}

const formatCurrency = (value) => {
  const num = Math.round(parseFloat(String(value ?? '0')) * 100) / 100
  if (Number.isNaN(num)) return String(value ?? '')

  const absolute = Math.abs(num)
  const integerPart = Math.floor(absolute)
  const decimalPart = Math.round((absolute - integerPart) * 100)

  const intStr = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const decStr = decimalPart < 10 ? '0' + String(decimalPart) : String(decimalPart)

  return num < 0 ? `-${intStr},${decStr}` : `${intStr},${decStr}`
}

export function createBudgetPdf({
  columns,
  rows,
  client = {},
  _documentType = 'presupuesto',
  totalAmount = '',
  notes = '',
  paymentMethods = [],
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  registerFonts(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 16
  const contentWidth = pageWidth - marginX * 2
  const innerRight = pageWidth - marginX - 6
  const bottomLimit = pageHeight - 24
  const newPageTop = 37

  const isMateriales = _documentType === 'materiales'
  const title = isMateriales ? 'Lista de materiales' : 'Presupuesto'
  const subtitle = isMateriales
    ? 'Materiales y cantidades requeridas para la ejecución del trabajo.'
    : 'Conceptos del trabajo, monto total y condiciones del servicio.'

  const clientName = String(client.clientName ?? '').trim()
  const preparedBy = String(client.preparedBy ?? '').trim()
  const preparedByContact = String(client.preparedByContact ?? '').trim()

  const paymentEntries = (Array.isArray(paymentMethods) ? paymentMethods : [])
    .map((method) => ({
      bank: String(method?.bank ?? '').trim(),
      account: String(method?.account ?? '').trim(),
    }))
    .filter((method) => method.bank || method.account)

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  doc.setProperties({
    title: `${title}${clientName ? ` — ${clientName}` : ''}`,
    subject: title,
    author: 'Taller de soldadura',
    creator: 'Taller de soldadura',
  })

  const label = (
    text,
    x,
    y,
    { size = 6.3, color = COLORS.muted, spacing = 0.55, align } = {},
  ) => {
    setText(doc, size, 600, color)
    doc.setCharSpace(spacing)
    doc.text(text, x, y, align ? { align } : undefined)
    doc.setCharSpace(0)
  }

  const textLines = (lines, x, y, lineHeight) => {
    lines.forEach((line, index) => {
      doc.text(line, x, y + index * lineHeight)
    })
  }

  const drawCard = (x, y, width, height, fill = COLORS.card) => {
    doc.setFillColor(...fill)
    doc.setDrawColor(...COLORS.rule)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, width, height, 2.5, 2.5, 'FD')
  }

  const drawContinuationHeader = () => {
    label('GUASAVE, SINALOA', marginX, 15.4, {
      size: 5.8,
      spacing: 0.5,
    })

    setText(doc, 8, 600, COLORS.ink)
    const headerText = `${title}${clientName ? ` · ${clientName}` : ''}`
    const headerLines = doc.splitTextToSize(headerText, contentWidth - 44)
    const firstLine = headerLines[0] ?? title
    doc.text(
      headerLines.length > 1
        ? `${firstLine.replace(/\s+\S*$/, '')}…`
        : firstLine,
      marginX,
      21,
    )

    setText(doc, 7, 400, COLORS.muted)
    doc.text(today, pageWidth - marginX, 21, { align: 'right' })

    doc.setDrawColor(...COLORS.softRule)
    doc.setLineWidth(0.3)
    doc.line(marginX, 25, pageWidth - marginX, 25)
  }

  // ---- Encabezado ----
  label('GUASAVE, SINALOA', marginX, 20.4, {
    size: 5.8,
    spacing: 0.55,
  })

  label('FECHA DE EMISIÓN', pageWidth - marginX, 15.4, {
    size: 5.8,
    spacing: 0.55,
    align: 'right',
  })

  setText(doc, 8, 600, COLORS.ink)
  doc.text(today, pageWidth - marginX, 20.4, { align: 'right' })

  doc.setDrawColor(...COLORS.softRule)
  doc.setLineWidth(0.3)
  doc.line(marginX, 26, pageWidth - marginX, 26)

  // ---- Título del documento ----
  setText(doc, 24, 700, COLORS.ink)
  doc.text(title, marginX, 42)

  setText(doc, 8, 400, COLORS.muted)
  doc.text(subtitle, marginX, 48.5)

  // ---- Datos generales ----
  const contentTop = 60

  const fieldX = [marginX + 6, 94, 138]
  const fieldWidths = [68, 40, 50]

  const fitField = (
    value,
    width,
    maxLines,
    { weight = 600, baseSize = 10.5, minSize = 8.6 } = {},
  ) => {
    const text = value || '—'
    let size = baseSize
    let lines = []

    while (size >= minSize) {
      setText(doc, size, weight, COLORS.ink)
      lines = doc.splitTextToSize(text, width)

      if (lines.length <= maxLines) break
      size -= 0.25
    }

    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines)
    }

    return { lines, size }
  }

  const clientField = fitField(clientName, fieldWidths[0], 3)
  const preparedField = fitField(preparedBy, fieldWidths[1], 2)

  const contactLines = (() => {
    if (!preparedByContact) return [{ text: '—', size: 8.2, empty: true }]

    const parts = preparedByContact
      .split('·')
      .map((part) => part.trim())
      .filter(Boolean)

    const lines =
      parts.length > 2
        ? [parts[0], parts.slice(1).join(' · ')]
        : parts.length > 0
          ? parts
          : [preparedByContact]

    return lines.slice(0, 2).map((line) => {
      setText(doc, 8.2, 400, COLORS.ink)
      let size = 8.2

      while (size > 6.2 && doc.getTextWidth(line) > fieldWidths[2]) {
        size -= 0.2
        setText(doc, size, 400, COLORS.ink)
      }

      return { text: line, size, empty: false }
    })
  })()

  const valueLineHeight = 4.8
  const valueLineCount = Math.max(
    clientField.lines.length,
    preparedField.lines.length,
    contactLines.length,
    1,
  )
  const generalCardHeight = 21 + (valueLineCount - 1) * valueLineHeight

  drawCard(marginX, contentTop, contentWidth, generalCardHeight)

  const generalValueY = contentTop + 12.5

  label('CLIENTE', fieldX[0], contentTop + 6.3, {
    size: 6,
    spacing: 0.45,
  })
  setText(
    doc,
    clientField.size,
    600,
    clientName ? COLORS.ink : COLORS.faint,
  )
  textLines(clientField.lines, fieldX[0], generalValueY, valueLineHeight)

  label('ELABORADO POR', fieldX[1], contentTop + 6.3, {
    size: 6,
    spacing: 0.45,
  })
  setText(
    doc,
    preparedField.size,
    600,
    preparedBy ? COLORS.ink : COLORS.faint,
  )
  textLines(preparedField.lines, fieldX[1], generalValueY, valueLineHeight)

  label('CONTACTO', fieldX[2], contentTop + 6.3, {
    size: 6,
    spacing: 0.45,
  })
  contactLines.forEach((entry, index) => {
    setText(
      doc,
      entry.size,
      400,
      entry.empty ? COLORS.faint : COLORS.ink,
    )
    doc.text(entry.text, fieldX[2], generalValueY + index * valueLineHeight)
  })

  let tableTop = contentTop + generalCardHeight + 14

  if (tableTop + 30 > bottomLimit) {
    doc.addPage()
    tableTop = newPageTop
  }

  const columnLabels = columns.map(
    (column, index) => String(column.label ?? '').trim() || `Columna ${index + 1}`,
  )
  const itemWidth = 13
  const dataWidth =
    columns.length > 0
      ? (contentWidth - itemWidth) / columns.length
      : contentWidth - itemWidth

  const head = [['ITEM', ...columnLabels.map((columnLabel) => columnLabel.toUpperCase())]]
  const body = rows.map((row, index) => [
    String(index + 1).padStart(2, '0'),
    ...columns.map((column) => formatCell(row.values[column.id])),
  ])

  const columnStyles = {
    0: {
      cellWidth: itemWidth,
      halign: 'center',
      fontStyle: '600normal',
      fontSize: 7.4,
      textColor: COLORS.muted,
    },
  }

  columns.forEach((_, index) => {
    columnStyles[index + 1] = {
      cellWidth: dataWidth,
      halign: 'left',
    }
  })

  autoTable(doc, {
    startY: tableTop,
    head,
    body,
    theme: 'grid',
    tableWidth: contentWidth,
    rowPageBreak: 'avoid',
    margin: { top: 30, left: marginX, right: marginX, bottom: 26 },
    styles: {
      font: FONT,
      fontStyle: 'normal',
      fontSize: 8.5,
      cellPadding: 3.2,
      textColor: COLORS.ink,
      lineColor: COLORS.rule,
      lineWidth: 0.18,
      valign: 'middle',
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: '600normal',
      fontSize: 6.5,
      cellPadding: 3.4,
      lineColor: COLORS.dark,
      lineWidth: 0.1,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLORS.altRow,
    },
    columnStyles,
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawContinuationHeader()
      }
    },
  })

  let y = (doc.lastAutoTable?.finalY ?? tableTop) + 16

  // ---- Totales y notas ----
  if (!isMateriales) {
    const formattedTotal = totalAmount ? formatCurrency(totalAmount) : '0,00'
    const totalRightX = innerRight
    const totalLabelX = 127
    const words = totalAmount ? numberToWords(totalAmount) : '—'

    setText(doc, 9, 400, COLORS.muted)
    const wordsLines = doc.splitTextToSize(words, 92)
    const wordsHeight = Math.max(wordsLines.length * 4.5, 4.5)
    const totalsCardHeight = 30 + Math.max(0, wordsLines.length - 2) * 4.5
    const totalsNeeded = totalsCardHeight + 6

    if (y + totalsNeeded > bottomLimit) {
      doc.addPage()
      drawContinuationHeader()
      y = newPageTop
    }

    const totalsTop = y
    drawCard(marginX, totalsTop, contentWidth, totalsCardHeight)

    doc.setDrawColor(...COLORS.softRule)
    doc.setLineWidth(0.25)
    doc.line(
      totalLabelX - 7,
      totalsTop + 6,
      totalLabelX - 7,
      totalsTop + totalsCardHeight - 6,
    )

    label('MONTO EN LETRAS', marginX + 6, totalsTop + 7, {
      size: 6.3,
      spacing: 0.6,
    })

    doc.setFillColor(...COLORS.green)
    doc.roundedRect(
      marginX + 6,
      totalsTop + 10.2,
      1.1,
      Math.max(wordsHeight, 5),
      0.55,
      0.55,
      'F',
    )

    setText(doc, 9, 400, COLORS.muted)
    textLines(wordsLines, marginX + 10.5, totalsTop + 13, 4.5)

    label('SUBTOTAL', totalLabelX, totalsTop + 7, {
      size: 6.3,
      spacing: 0.6,
    })
    setText(doc, 8.8, 400, COLORS.ink)
    doc.text(`$ ${formattedTotal}`, totalRightX, totalsTop + 7, {
      align: 'right',
    })

    label('IMPUESTO', totalLabelX, totalsTop + 12.5, {
      size: 6.3,
      spacing: 0.6,
    })
    setText(doc, 8.8, 400, COLORS.ink)
    doc.text('$ 0,00', totalRightX, totalsTop + 12.5, { align: 'right' })

    doc.setDrawColor(...COLORS.softRule)
    doc.setLineWidth(0.25)
    doc.line(
      totalLabelX,
      totalsTop + 16,
      totalRightX,
      totalsTop + 16,
    )

    label('TOTAL', totalLabelX, totalsTop + 22, {
      size: 7,
      color: COLORS.ink,
      spacing: 0.5,
    })
    setText(doc, 16, 700, COLORS.ink)
    doc.text(`$ ${formattedTotal}`, totalRightX, totalsTop + 23, {
      align: 'right',
    })

    // ---- Notas y condiciones ----
    let notesBottom = totalsTop + totalsCardHeight

    if (notes.trim()) {
      setText(doc, 8.2, 400, COLORS.muted)
      let noteLines = doc.splitTextToSize(notes.trim(), contentWidth - 12)
      let noteY = totalsTop + totalsCardHeight + 9
      let continuation = false

      while (noteLines.length > 0) {
        if (noteY + 17 > bottomLimit) {
          doc.addPage()
          drawContinuationHeader()
          noteY = newPageTop
        }

        label(
          continuation
            ? 'NOTAS Y CONDICIONES · CONTINUACIÓN'
            : 'NOTAS Y CONDICIONES',
          marginX,
          noteY,
          {
            size: 6.3,
            color: COLORS.green,
            spacing: 0.8,
          },
        )

        const cardTop = noteY + 4.5
        const maxLines = Math.max(
          1,
          Math.floor((bottomLimit - cardTop - 10) / 4.5),
        )
        const chunk = noteLines.slice(0, maxLines)
        const noteCardHeight = 10 + chunk.length * 4.5

        drawCard(marginX, cardTop, contentWidth, noteCardHeight)

        setText(doc, 8.2, 400, COLORS.muted)
        textLines(chunk, marginX + 6, cardTop + 6.2, 4.5)

        notesBottom = cardTop + noteCardHeight
        noteLines = noteLines.slice(chunk.length)
        continuation = true

        if (noteLines.length > 0) {
          doc.addPage()
          drawContinuationHeader()
          noteY = newPageTop
        }
      }
    }

    // ---- Métodos de pago ----
    if (paymentEntries.length > 0) {
      const fitSingleLine = (
        text,
        width,
        { weight = 400, baseSize = 8.8, minSize = 6.4 } = {},
      ) => {
        const value = String(text ?? '') || '—'
        let size = baseSize

        setText(doc, size, weight, COLORS.ink)

        while (size > minSize && doc.getTextWidth(value) > width) {
          size -= 0.2
          setText(doc, size, weight, COLORS.ink)
        }

        let display = value
        if (doc.getTextWidth(display) > width) {
          while (
            display.length > 1 &&
            doc.getTextWidth(`${display}…`) > width
          ) {
            display = display.slice(0, -1)
          }
          display = `${display}…`
        }

        return { text: display, size }
      }

      const bankWidth = 84
      const accountWidth = 64
      let paymentY = notesBottom + 9
      let paymentIndex = 0
      let continuation = false

      while (paymentIndex < paymentEntries.length) {
        if (paymentY + 4.5 + 18.2 > bottomLimit) {
          doc.addPage()
          drawContinuationHeader()
          paymentY = newPageTop
        }

        label(
          continuation
            ? 'MÉTODOS DE PAGO · CONTINUACIÓN'
            : 'MÉTODOS DE PAGO',
          marginX,
          paymentY,
          {
            size: 6.3,
            color: COLORS.green,
            spacing: 0.8,
          },
        )

        const cardTop = paymentY + 4.5
        const maxRows = Math.max(
          1,
          Math.floor((bottomLimit - cardTop - 10) / 8.2),
        )
        const chunk = paymentEntries.slice(paymentIndex, paymentIndex + maxRows)
        const cardHeight = 10 + chunk.length * 8.2

        drawCard(marginX, cardTop, contentWidth, cardHeight)

        chunk.forEach((entry, index) => {
          const rowY = cardTop + 7.2 + index * 8.2
          const bank = fitSingleLine(entry.bank, bankWidth, {
            weight: 600,
            baseSize: 8.8,
            minSize: 6.4,
          })
          const account = fitSingleLine(entry.account, accountWidth, {
            weight: 400,
            baseSize: 8.8,
            minSize: 6.4,
          })

          setText(
            doc,
            bank.size,
            600,
            entry.bank ? COLORS.ink : COLORS.faint,
          )
          doc.text(bank.text, marginX + 6, rowY)

          setText(
            doc,
            account.size,
            400,
            entry.account ? COLORS.ink : COLORS.faint,
          )
          doc.text(account.text, innerRight, rowY, { align: 'right' })

          if (index < chunk.length - 1) {
            doc.setDrawColor(...COLORS.softRule)
            doc.setLineWidth(0.2)
            doc.line(marginX + 6, rowY + 4.1, innerRight, rowY + 4.1)
          }
        })

        paymentIndex += chunk.length
        continuation = true

        if (paymentIndex < paymentEntries.length) {
          doc.addPage()
          drawContinuationHeader()
          paymentY = newPageTop
        }
      }
    }
  }

  // ---- Pie de página ----
  const pageCount = doc.getNumberOfPages()
  doc.setCharSpace(0)

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)

    doc.setDrawColor(...COLORS.rule)
    doc.setLineWidth(0.3)
    doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16)

    setText(doc, 6.3, 400, COLORS.muted)
    doc.text(
      `Documento generado el ${today}`,
      marginX,
      pageHeight - 11,
    )

    setText(doc, 6.3, 600, COLORS.muted)
    doc.text(
      `Página ${page} de ${pageCount}`,
      pageWidth - marginX,
      pageHeight - 11,
      { align: 'right' },
    )
  }

  return doc
}

const formatCell = (value) => {
  const rawValue = String(value ?? '').trim()
  return rawValue
}

const numberToWords = (amount) => {
  const UNIDADES = [
    '', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  ]
  const DECENAS = [
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
    'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  ]
  const DECENAS_MULTIPLOS = [
    '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta',
    'sesenta', 'setenta', 'ochenta', 'noventa',
  ]
  const CENTENAS = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos',
    'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
  ]

  const convertHundreds = (n) => {
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
            '', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro',
            'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
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

  const num = Math.round(parseFloat(String(amount ?? '0')) * 100) / 100
  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)

  if (integerPart === 0) {
    const decStr = decimalPart < 10 ? '0' + String(decimalPart) : String(decimalPart)
    return 'Cero con ' + decStr + '/100'
  }

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

    const grupoIndex = grupos.length - 1 - i
    let grupoTexto = convertHundreds(grupo)

    if (grupoIndex === 1) {
      grupoTexto = grupo === 1 ? 'mil' : grupoTexto + ' mil'
    } else if (grupoIndex === 2) {
      grupoTexto = grupo === 1 ? 'un millón' : grupoTexto + ' millones'
    } else if (grupoIndex === 3) {
      grupoTexto = grupo === 1 ? 'mil millones' : grupoTexto + ' mil millones'
    }

    parts.push(grupoTexto)
  }

  let words = parts.join(' ')
  const decStr = decimalPart < 10 ? '0' + String(decimalPart) : String(decimalPart)
  words += ' con ' + decStr + '/100'

  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function exportTableToPdf(options) {
  const doc = createBudgetPdf(options)
  const datePart = new Date().toISOString().slice(0, 10)

  if (options.filename) {
    doc.save(options.filename)
    return
  }

  const filenameSlug =
    options._documentType === 'materiales' ? 'lista-materiales' : 'presupuesto'
  doc.save(`${filenameSlug}-${datePart}.pdf`)
}
