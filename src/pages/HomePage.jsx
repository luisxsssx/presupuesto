import { Link } from 'react-router-dom'

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

const DOCUMENTS = [
  {
    to: '/presupuesto',
    index: '01',
    title: 'Presupuesto',
    description:
      'Conceptos del trabajo, monto total, condiciones y notas para presentar al cliente.',
  },
  {
    to: '/lista-materiales',
    index: '02',
    title: 'Lista de materiales',
    description:
      'Relación de materiales y cantidades requeridas para la ejecución del trabajo.',
  },
]

const TODAY = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const STEPS = [
  {
    index: '01',
    title: 'Datos del documento',
    description: 'Cliente y responsable de la cotización.',
  },
  {
    index: '02',
    title: 'Detalle del trabajo',
    description: 'Conceptos, materiales y cantidades.',
  },
  {
    index: '03',
    title: 'Exportación',
    description: 'PDF listo para entregar o imprimir.',
  },
]

function HomePage({ theme }) {
  const cn = (...classes) => classes.filter(Boolean).join(' ')

  return (
    <div className="mx-auto max-w-5xl">
      <div className={`h-1 w-10 rounded-full ${theme.accentBar}`} />

      <div className="mt-7 flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.accent}`}
          >
            Documentos comerciales
          </p>
          <h1
            className={`mt-3 max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-[2.5rem] ${theme.heading}`}
          >
            Presupuestos y listas de materiales
          </h1>
          <p
            className={`mt-4 max-w-xl text-sm leading-relaxed ${theme.muted}`}
          >
            Prepara los datos de forma ordenada y expórtala
            en PDF para presentarla al cliente.
          </p>
        </div>
        <p
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-medium md:mb-1 ${theme.surfaceBorder} ${theme.surface} ${theme.muted}`}
        >
          {TODAY}
        </p>
      </div>

      <div className="flex items-baseline justify-between">
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.muted}`}
        >
          Índice de documentos
        </span>
        <span
          className={`text-[10px] font-medium uppercase tracking-[0.14em] ${theme.muted}`}
        >
          02 formatos
        </span>
      </div>

      <div
        className={`mt-3 overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(24,24,27,0.04)] ${theme.surfaceBorder} ${theme.surface}`}
      >
        {DOCUMENTS.map((document, index) => (
          <Link
            key={document.to}
            to={document.to}
            className={cn(
              'group grid grid-cols-[2rem_1fr_auto] items-center gap-4 px-5 py-6 transition-colors sm:grid-cols-[3rem_1fr_auto] sm:gap-6 sm:px-7 sm:py-7',
              index > 0 && `border-t ${theme.rule}`,
              theme.rowHover,
            )}
          >
            <span
              className={`text-sm font-semibold tabular-nums ${theme.accent}`}
            >
              {document.index}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-xl font-semibold leading-snug sm:text-2xl ${theme.heading}`}
              >
                {document.title}
              </span>
              <span
                className={`mt-1.5 block max-w-xl text-sm leading-relaxed ${theme.muted}`}
              >
                {document.description}
              </span>
            </span>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 group-hover:translate-x-0.5 ${theme.arrow}`}
            >
              <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>

      <div className={`mt-14 border-t pt-8 ${theme.rule}`}>
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.muted}`}
        >
          Flujo de trabajo
        </p>
        <div className="mt-6 grid gap-7 sm:grid-cols-3 sm:gap-10">
          {STEPS.map((step) => (
            <div key={step.index}>
              <p className={`text-xs font-semibold tabular-nums ${theme.accent}`}>
                {step.index}
              </p>
              <h2 className={`mt-2 text-sm font-medium ${theme.heading}`}>
                {step.title}
              </h2>
              <p className={`mt-1.5 text-xs leading-relaxed ${theme.muted}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
