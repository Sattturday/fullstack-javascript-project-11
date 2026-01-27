import i18next from 'i18next'
import initView from './view.js'
import buildSchema from './validation.js'

export default () => {
  const state = {
    form: {
      error: null,
    },
    feeds: [],
  }

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input[name="url"]'),
    feedback: document.querySelector('.feedback'),
  }

  const watchedState = initView(state, elements, i18next)

  const validate = (url) => {
    const urls = state.feeds.map(feed => feed.url)
    return buildSchema(urls).validate(url)
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = new FormData(e.target).get('url').trim()

    validate(url)
      .then(() => {
        watchedState.feeds.push({ url })
        watchedState.form.error = null

        elements.input.value = ''
        elements.input.focus()
      })
      .catch((err) => {
        watchedState.form.error = err.message
      })
  })
}
