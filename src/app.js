import i18next from 'i18next'
import initView from './view.js'
import buildSchema from './validation.js'
import { loadRss } from './rss.js'

export default () => {
  const state = {
    form: {
      error: null,
      status: 'idle', // 'idle' | 'sending' | 'success' | 'error'
    },
    feeds: [], // { id, title, description }
    posts: [], // { id, feedId, title, link }
  }

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input[name="url"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  }

  const watchedState = initView(state, elements, i18next)

  const validate = (url) => {
    const urls = state.feeds.map(feed => feed.url)
    return buildSchema(urls).validate(url)
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const url = new FormData(e.target).get('url').trim()

    watchedState.form.error = null
    watchedState.form.status = 'sending'

    validate(url)
      .then(() => loadRss(url))
      .then(({ feed, posts }) => {
        watchedState.feeds.push(feed)
        watchedState.posts.push(...posts)
        watchedState.form.status = 'success'
        elements.input.value = ''
        elements.input.focus()
      })
      .catch((err) => {
        watchedState.form.status = 'error'

        let errorKey = 'form.errors.unknown'

        if (err.message === 'network') errorKey = 'form.errors.network'
        else if (err.message === 'timeout') errorKey = 'form.errors.timeout'
        else if (err.message === 'invalidRss') errorKey = 'form.errors.invalidRss'
        else if (err.message === 'emptyResponse') errorKey = 'form.errors.emptyResponse'
        else if (err.message === 'offline') errorKey = 'form.errors.offline'
        else if (err.message.includes('already exists')) errorKey = 'form.errors.duplicate'
        else if (err.message.includes('valid')) errorKey = 'form.errors.invalidUrl'

        watchedState.form.error = i18next.t(errorKey)
      })
  })
}
