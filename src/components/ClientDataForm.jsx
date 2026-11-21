function Field({ label, placeholder, value, onChange, theme }) {
  return (
    <label className="block">
      <span
        className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.muted}`}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`mt-2 w-full text-sm outline-none transition-all duration-200 ${theme.input}`}
      />
    </label>
  )
}

function ClientDataForm({ client, onChange, theme }) {
  const updateField = (field) => (value) => {
    onChange({ ...client, [field]: value })
  }

  return (
    <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
      <Field
        label="Cliente"
        placeholder="Ej. Juan Pérez"
        value={client.clientName}
        onChange={updateField('clientName')}
        theme={theme}
      />
      <Field
        label="Elaborado por"
        placeholder="Ej. María García"
        value={client.preparedBy}
        onChange={updateField('preparedBy')}
        theme={theme}
      />
      <Field
        label="Contacto"
        placeholder="Teléfono o email"
        value={client.preparedByContact}
        onChange={updateField('preparedByContact')}
        theme={theme}
      />
    </div>
  )
}

export default ClientDataForm
