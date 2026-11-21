import { useState } from 'react'
import { Link } from 'react-router-dom'
import ClientDataForm from './ClientDataForm'
import { numberToWords } from '../utils/numberToWords.js'

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const INITIAL_COLUMNS = [
  { id: 'col-1', label: 'Concepto', type: 'text' },
  { id: 'col-2', label: 'Descripción', type: 'text' },
]

const MIN_COLUMNS = 1
const MAX_COLUMNS = 3

const createRow = (columns) => ({
  id: createId(),
  values: Object.fromEntries(columns.map((column) => [column.id, ''])),
})

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function Section({ index, title, description, theme, children }) {
  return (
    <section className={`border-t px-5 py-7 first:border-t-0 sm:px-8 sm:py-9 ${theme.rule}`}>
      <div className="grid gap-6 md:grid-cols-[170px_1fr] md:gap-10 lg:grid-cols-[200px_1fr]">
        <div>
          <p className={`text-xs font-semibold tabular-nums ${theme.accent}`}>
            {index}
          </p>
          <h2
            className={`mt-1.5 text-lg font-semibold leading-snug ${theme.heading}`}
          >
            {title}
          </h2>
          {description ? (
            <p className={`mt-2.5 text-xs leading-relaxed ${theme.muted}`}>
              {description}
            </p>
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

function TwoColumnForm({ documentType = 'presupuesto', theme }) {
  const isMateriales = documentType === 'materiales'

  const [client, setClient] = useState({
    clientName: '',
    preparedBy: '',
    preparedByContact: '',
  })
  const [columns, setColumns] = useState(
    INITIAL_COLUMNS.map((column) => ({
      ...column,
      type: 'text',
      label:
        documentType === 'materiales' && column.id === 'col-2'
          ? 'Cantidad'
          : column.label,
    })),
  )
  const [rows, setRows] = useState(() => [createRow(columns)])
  const [totalAmount, setTotalAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [isExporting, setIsExporting] = useState(false)

  const filledRows = rows.filter((row) =>
    columns.some(
      (column) => String(row.values[column.id] ?? '').trim() !== '',
    ),
  )
  const canExport = filledRows.length > 0

  const filledPaymentMethods = paymentMethods
    .map((method) => ({
      bank: method.bank.trim(),
      account: method.account.trim(),
    }))
    .filter((method) => method.bank || method.account)

  const clientSlug = String(client.clientName ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')

  const exportFilename = clientSlug
    ? `${clientSlug}_${isMateriales ? 'lista_material' : 'cotizacion'}.pdf`
    : undefined

  const handleExportPdf = async () => {
    if (!canExport || isExporting) return

    setIsExporting(true)
    try {
      const { exportTableToPdf } = await import('../utils/exportTableToPdf')
      exportTableToPdf({
        columns,
        rows: filledRows,
        client,
        _documentType: documentType,
        totalAmount,
        notes,
        paymentMethods: filledPaymentMethods,
        filename: exportFilename,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const addRow = () => {
    setRows((previous) => [...previous, createRow(columns)])
  }

  const removeRow = (rowId) => {
    setRows((previous) => previous.filter((row) => row.id !== rowId))
  }

  const updateCell = (rowId, columnId, value) => {
    setRows((previous) =>
      previous.map((row) =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [columnId]: value } }
          : row,
      ),
    )
  }

  const updateColumnLabel = (columnId, label) => {
    setColumns((previous) =>
      previous.map((column) =>
        column.id === columnId ? { ...column, label } : column,
      ),
    )
  }

  const addColumn = () => {
    if (columns.length >= MAX_COLUMNS) return

    const column = { id: createId(), label: '', type: 'text' }

    setColumns((previous) => [...previous, column])
    setRows((previous) =>
      previous.map((row) => ({
        ...row,
        values: { ...row.values, [column.id]: '' },
      })),
    )
  }

  const removeColumn = (columnId) => {
    if (columns.length <= MIN_COLUMNS) return

    setColumns((previous) =>
      previous.filter((column) => column.id !== columnId),
    )
    setRows((previous) =>
      previous.map((row) => {
        const values = { ...row.values }
        delete values[columnId]
        return { ...row, values }
      }),
    )
  }

  const canAddColumn = columns.length < MAX_COLUMNS
  const canRemoveColumn = columns.length > MIN_COLUMNS

  const addPaymentMethod = () => {
    setPaymentMethods((previous) => [
      ...previous,
      { id: createId(), bank: '', account: '' },
    ])
  }

  const removePaymentMethod = (methodId) => {
    setPaymentMethods((previous) =>
      previous.filter((method) => method.id !== methodId),
    )
  }

  const updatePaymentMethod = (methodId, field, value) => {
    setPaymentMethods((previous) =>
      previous.map((method) =>
        method.id === methodId ? { ...method, [field]: value } : method,
      ),
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.accent}`}
          >
            {isMateriales ? 'Documento de obra' : 'Documento comercial'}
          </p>
          <h1
            className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${theme.heading}`}
          >
            {isMateriales ? 'Lista de materiales' : 'Presupuesto'}
          </h1>
          <p className={`mt-3 max-w-xl text-sm leading-relaxed ${theme.muted}`}>
            {isMateriales
              ? 'Registra los materiales y las cantidades necesarias para ejecutar el trabajo.'
              : 'Detalla los conceptos del trabajo, el monto total y las condiciones del servicio.'}
          </p>
        </div>
        <Link
          to="/"
          className={`inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium transition-opacity hover:opacity-60 ${theme.muted}`}
        >
          <span aria-hidden="true">←</span>
          Volver al índice
        </Link>
      </div>

      <div
        className={`overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(24,24,27,0.04)] ${theme.surfaceBorder} ${theme.surface}`}
      >
        <Section
          index="01"
          title="Datos generales"
          description="Cliente y responsable del documento."
          theme={theme}
        >
          <ClientDataForm client={client} onChange={setClient} theme={theme} />
        </Section>

        <Section
          index="02"
          title="Columnas"
          description="Controla las columnas del detalle. Mínimo 1, máximo 3."
          theme={theme}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column, index) => (
              <div key={column.id} className="block">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                  >
                    Columna {String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeColumn(column.id)}
                    disabled={!canRemoveColumn}
                    title={
                      canRemoveColumn
                        ? `Eliminar columna ${index + 1}`
                        : 'Debe quedar al menos una columna'
                    }
                    aria-label={`Eliminar columna ${index + 1}`}
                    className={`cursor-pointer rounded-md p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${theme.muted} ${theme.dangerHover}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
                <input
                  type="text"
                  value={column.label}
                  onChange={(event) =>
                    updateColumnLabel(column.id, event.target.value)
                  }
                  placeholder={`Columna ${index + 1}`}
                  className={`mt-2 w-full text-sm outline-none transition-all duration-200 ${theme.input}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className={`text-xs ${theme.muted}`}>
              {canAddColumn
                ? `${columns.length} de ${MAX_COLUMNS} columnas`
                : `Máximo de ${MAX_COLUMNS} columnas`}
            </span>
            <button
              type="button"
              onClick={addColumn}
              disabled={!canAddColumn}
              title={
                canAddColumn
                  ? 'Agregar columna al detalle'
                  : `Máximo ${MAX_COLUMNS} columnas`
              }
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${theme.btnGhost}`}
            >
              <PlusIcon />
              Agregar columna
            </button>
          </div>
        </Section>

        <Section
          index="03"
          title="Detalle"
          description={
            isMateriales
              ? 'Completa una fila por material.'
              : 'Completa una fila por concepto.'
          }
          theme={theme}
        >
          {rows.length === 0 ? (
            <div className={`rounded-xl border border-dashed py-10 text-center ${theme.surfaceBorder}`}>
              <p className={`text-sm ${theme.muted}`}>
                Este documento todavía no tiene filas.
              </p>
              <button
                type="button"
                onClick={addRow}
                className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${theme.btnPrimary}`}
              >
                <PlusIcon />
                Agregar primera fila
              </button>
            </div>
          ) : (
            <>
              <div
                className={`overflow-hidden rounded-xl border ${theme.surfaceBorder}`}
              >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.rule} ${theme.tableHead}`}
                    >
                      <th className="w-10 py-2.5 pl-3 pr-2 text-left font-semibold">
                        #
                      </th>
                      {columns.map((column, index) => (
                        <th
                          key={column.id}
                          className="px-2 py-2.5 text-left font-semibold"
                        >
                          {column.label.trim() || `Columna ${index + 1}`}
                        </th>
                      ))}
                      <th className="w-10 py-2.5 pl-2 pr-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        className={`border-b last:border-b-0 transition-colors ${theme.rule} ${theme.rowHover}`}
                      >
                        <td
                          className={`w-10 py-1.5 pl-3 pr-2 text-xs font-medium tabular-nums ${theme.muted}`}
                        >
                          {String(rowIndex + 1).padStart(2, '0')}
                        </td>
                        {columns.map((column, columnIndex) => (
                          <td key={column.id} className="px-1 py-1">
                            <input
                              type="text"
                              value={row.values[column.id] ?? ''}
                              onChange={(event) =>
                                updateCell(row.id, column.id, event.target.value)
                              }
                              aria-label={`${
                                column.label.trim() || `Columna ${columnIndex + 1}`
                              }, fila ${rowIndex + 1}`}
                              className={`w-full text-sm outline-none transition-all duration-200 ${theme.cellInput}`}
                            />
                          </td>
                        ))}
                        <td className="w-10 py-1.5 pl-2 pr-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            title="Eliminar fila"
                            aria-label={`Eliminar fila ${rowIndex + 1}`}
                            className={`cursor-pointer rounded-md p-1.5 transition-colors ${theme.muted} ${theme.dangerHover}`}
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={addRow}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${theme.btnGhost}`}
                >
                  <PlusIcon />
                  Agregar fila
                </button>
                <span className={`hidden text-xs sm:block ${theme.muted}`}>
                  {rows.length} {rows.length === 1 ? 'fila' : 'filas'} en total
                </span>
              </div>
            </>
          )}
        </Section>

        {!isMateriales && (
          <Section
            index="04"
            title="Totales y notas"
            description="Monto total del trabajo y condiciones del servicio."
            theme={theme}
          >
            <div className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span
                    className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                  >
                    Monto total
                  </span>
                  <input
                    type="text"
                    value={totalAmount}
                    onChange={(event) =>
                      setTotalAmount(event.target.value.replace(/[^0-9.]/g, ''))
                    }
                    placeholder="0,00"
                    className={`mt-2 w-full text-2xl font-semibold tabular-nums outline-none transition-all duration-200 ${theme.input}`}
                  />
                </label>

                <div>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                  >
                    Monto en letras
                  </p>
                  <p
                    className={`mt-2 border-l-2 pl-3 text-sm leading-relaxed ${theme.quote}`}
                  >
                    {totalAmount ? numberToWords(totalAmount) : '—'}
                  </p>
                </div>
              </div>

              <label className="block">
                <span
                  className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                >
                  Notas y condiciones
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ej. Tiempo de entrega: 5 días. Forma de pago: 50% al iniciar y 50% al entregar."
                  rows="4"
                  className={`mt-2 w-full resize-y text-sm outline-none transition-all duration-200 ${theme.textarea}`}
                />
              </label>

              <div className={`border-t pt-8 ${theme.rule}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                  >
                    Métodos de pago
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${theme.surfaceBorder} ${theme.muted}`}
                  >
                    Opcional
                  </span>
                </div>
                <p
                  className={`mt-2 max-w-xl text-xs leading-relaxed ${theme.muted}`}
                >
                  Agrega el banco y el número de tarjeta o cuenta. Puedes
                  registrar varios métodos.
                </p>

                {paymentMethods.length === 0 ? (
                  <div
                    className={`mt-4 flex flex-col items-start gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between ${theme.surfaceBorder}`}
                  >
                    <p className={`text-xs ${theme.muted}`}>
                      Sin métodos de pago. Este apartado es opcional.
                    </p>
                    <button
                      type="button"
                      onClick={addPaymentMethod}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${theme.btnGhost}`}
                    >
                      <PlusIcon />
                      Agregar método de pago
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 space-y-3">
                      {paymentMethods.map((method, index) => (
                        <div
                          key={method.id}
                          className={`grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-4 sm:p-4 ${theme.surfaceBorder}`}
                        >
                          <label className="block">
                            <span
                              className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                            >
                              Banco o método
                            </span>
                            <input
                              type="text"
                              value={method.bank}
                              onChange={(event) =>
                                updatePaymentMethod(
                                  method.id,
                                  'bank',
                                  event.target.value,
                                )
                              }
                              placeholder="Ej. Banorte"
                              className={`mt-2 w-full text-sm outline-none transition-all duration-200 ${theme.input}`}
                            />
                          </label>
                          <label className="block">
                            <span
                              className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
                            >
                              Número de tarjeta o cuenta
                            </span>
                            <input
                              type="text"
                              value={method.account}
                              onChange={(event) =>
                                updatePaymentMethod(
                                  method.id,
                                  'account',
                                  event.target.value,
                                )
                              }
                              placeholder="Ej. 1234 5678 9012 3456"
                              className={`mt-2 w-full text-sm outline-none transition-all duration-200 ${theme.input}`}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removePaymentMethod(method.id)}
                            title={`Eliminar método de pago ${index + 1}`}
                            aria-label={`Eliminar método de pago ${index + 1}`}
                            className={`cursor-pointer justify-self-start rounded-md p-2 transition-colors sm:mb-1 ${theme.muted} ${theme.dangerHover}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={addPaymentMethod}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${theme.btnGhost}`}
                      >
                        <PlusIcon />
                        Agregar otro método
                      </button>
                      <span className={`text-xs ${theme.muted}`}>
                        {paymentMethods.length}{' '}
                        {paymentMethods.length === 1 ? 'método' : 'métodos'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Section>
        )}

        <div
          className={`flex flex-col gap-4 border-t px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${theme.rule} ${theme.subtle}`}
        >
          <div className="min-w-0">
            <p className={`text-xs font-medium ${theme.muted}`}>
              {filledRows.length}{' '}
              {filledRows.length === 1 ? 'fila lista' : 'filas listas'} para
              exportar
            </p>
            <p className={`mt-1 truncate text-xs ${theme.muted}`}>
              {exportFilename ?? 'El nombre del PDF se asigna al exportar'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={!canExport || isExporting}
            title={
              canExport
                ? isMateriales
                  ? 'Descargar la lista de materiales en PDF'
                  : 'Descargar el presupuesto en PDF'
                : 'Agrega datos para poder exportar'
            }
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${theme.btnPrimary}`}
          >
            {isExporting ? 'Generando PDF…' : 'Exportar PDF'}
            <DownloadIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TwoColumnForm
