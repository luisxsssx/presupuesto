import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TwoColumnForm from './components/TwoColumnForm'

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" />
    </svg>
  )
}

const CURRENT_YEAR = new Date().getFullYear()

const LIGHT = {
  bg: 'bg-[#fafaf9]',
  text: 'text-[#18181b]',
  header: 'bg-[#fafaf9]/90',
  headerBorder: 'border-[#ebeae7]',
  heading: 'text-[#18181b]',
  muted: 'text-[#71717a]',
  accent: 'text-[#386641]',
  accentBar: 'bg-[#386641]',
  mark: 'border-[#386641]/25 bg-[#386641]/5 text-[#386641]',
  rule: 'border-[#efefec]',
  surface: 'bg-white',
  surfaceBorder: 'border-[#e7e7e3]',
  subtle: 'bg-[#f7f7f5]',
  input:
    'rounded-lg border border-[#e4e4e0] bg-white px-3 py-2.5 text-[#18181b] placeholder:text-[#a1a1aa] focus:border-[#386641] focus:ring-4 focus:ring-[#386641]/10',
  textarea:
    'rounded-lg border border-[#e4e4e0] bg-white px-3 py-2.5 text-[#18181b] placeholder:text-[#a1a1aa] focus:border-[#386641] focus:ring-4 focus:ring-[#386641]/10',
  cellInput:
    'rounded-lg border border-[#ececea] bg-white px-3 py-2 text-[#18181b] placeholder:text-[#a1a1aa] hover:border-[#dcdcd6] focus:border-[#386641] focus:ring-2 focus:ring-[#386641]/10',
  tableHead: 'bg-[#f7f7f5] text-[#71717a]',
  rowHover: 'hover:bg-[#fafaf9]',
  btnPrimary: 'bg-[#386641] text-white hover:bg-[#2f5738]',
  btnGhost:
    'border-[#e4e4e0] bg-white text-[#3f3f46] hover:border-[#386641]/40 hover:bg-[#386641]/5 hover:text-[#386641]',
  arrow:
    'border-[#e4e4e0] bg-white text-[#71717a] group-hover:border-[#386641] group-hover:bg-[#386641] group-hover:text-white',
  quote: 'border-[#386641] text-[#3f3f46]',
  dangerHover: 'hover:text-[#b91c1c]',
}

const DARK = {
  bg: 'bg-[#111111]',
  text: 'text-[#f1f0eb]',
  header: 'bg-[#111111]/95',
  headerBorder: 'border-[#2a2a26]',
  heading: 'text-[#f1f0eb]',
  muted: 'text-[#96988f]',
  accent: 'text-[#8fb597]',
  accentBar: 'bg-[#8fb597]',
  mark: 'border-[#8fb597]/40 text-[#8fb597]',
  rule: 'border-[#282824]',
  surface: 'bg-[#171717]',
  surfaceBorder: 'border-[#2c2c27]',
  subtle: 'bg-[#1c1c19]',
  input:
    'rounded-lg border border-[#30302b] bg-[#131312] px-3 py-2.5 text-[#f1f0eb] placeholder:text-[#5f615a] focus:border-[#8fb597] focus:ring-4 focus:ring-[#8fb597]/10',
  textarea:
    'rounded-lg border border-[#30302b] bg-[#131312] px-3 py-2.5 text-[#f1f0eb] placeholder:text-[#5f615a] focus:border-[#8fb597] focus:ring-4 focus:ring-[#8fb597]/10',
  cellInput:
    'rounded-lg border border-[#2f2f29] bg-[#141413] px-3 py-2 text-[#f1f0eb] placeholder:text-[#5f615a] hover:border-[#3f3f38] focus:border-[#8fb597] focus:ring-2 focus:ring-[#8fb597]/10',
  tableHead: 'bg-[#1c1c19] text-[#96988f]',
  rowHover: 'hover:bg-[#1b1b18]',
  btnPrimary: 'bg-[#386641] text-white hover:bg-[#477a51]',
  btnGhost:
    'border-[#3a3a34] text-[#c0c1b8] hover:border-[#8fb597] hover:text-[#8fb597]',
  arrow:
    'border-[#3a3a34] text-[#96988f] group-hover:border-[#8fb597] group-hover:bg-[#8fb597] group-hover:text-[#111111]',
  quote: 'border-[#8fb597] text-[#c0c1b8]',
  dangerHover: 'hover:text-[#d98a80]',
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('taller-theme') === 'dark'
  })

  useEffect(() => {
    window.localStorage.setItem('taller-theme', isDark ? 'dark' : 'light')
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  const theme = isDark ? DARK : LIGHT

  return (
    <BrowserRouter>
      <div
        className={`flex min-h-screen flex-col transition-colors duration-300 ${theme.bg} ${theme.text}`}
      >
        <header
          className={`sticky top-0 z-40 border-b backdrop-blur ${theme.headerBorder} ${theme.header}`}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <Link
              to="/"
              className="group flex items-center gap-3"
              title="Volver al índice"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[13px] font-bold ${theme.mark}`}
              >
                GP
              </span>
              <span className="flex flex-col">
                <span
                  className={`mt-1 text-[15px] font-semibold leading-none ${theme.heading}`}
                >
                  Gestión de presupuestos
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                to="/"
                className={`hidden text-xs font-medium transition-opacity hover:opacity-60 sm:inline ${theme.muted}`}
              >
                Inicio
              </Link>
              <button
                type="button"
                onClick={() => setIsDark((previous) => !previous)}
                aria-label={
                  isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
                }
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${theme.btnGhost}`}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
                <span className="hidden sm:inline">
                  {isDark ? 'Modo claro' : 'Modo oscuro'}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 lg:py-14">
          <Routes>
            <Route path="/" element={<HomePage theme={theme} />} />
            <Route
              path="/presupuesto"
              element={
                <TwoColumnForm documentType="presupuesto" theme={theme} />
              }
            />
            <Route
              path="/lista-materiales"
              element={<TwoColumnForm documentType="materiales" theme={theme} />}
            />
          </Routes>
        </main>

        <footer className={`border-t ${theme.headerBorder}`}>
          <div
            className={`mx-auto flex max-w-6xl flex-col gap-1.5 px-5 py-6 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:px-8 ${theme.muted}`}
          >
            <span>Taller de soldadura · Documentos internos</span>
            <span>{CURRENT_YEAR}</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
