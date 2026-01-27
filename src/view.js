import onChange from 'on-change'

export default (state, elements, i18n) =>
  onChange(state, (path, value) => {
    if (path === 'form.error') {
      elements.input.classList.toggle('is-invalid', Boolean(value))
      elements.feedback.textContent = value
        ? i18n.t(`form.errors.${value}`)
        : ''
    }
  })
