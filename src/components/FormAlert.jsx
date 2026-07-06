export default function FormAlert({ type = 'error', message }) {
  if (!message) {
    return null
  }

  return (
    <p className={`form-message ${type}`} role="alert">
      {message}
    </p>
  )
}
