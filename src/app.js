import i18next from 'i18next'
import initView from './view.js'
import buildSchema from './validation.js'
import { loadRss, checkForUpdates } from './rss.js'

export default () => {
  const state = {
    form: {
      error: null,
      status: 'idle', // 'idle' | 'sending' | 'success' | 'error'
    },
    feeds: [], // { id, url, title, description }
    posts: [], // { id, feedId, title, link, description, read }
    ui: {
      modalPostId: null,
    },
  }

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input[name="url"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  }

  const watchedState = initView(state, elements, i18next)

  elements.posts.addEventListener('click', (e) => {
    const { id } = e.target.dataset
    if (!id) return

    const post = watchedState.posts.find(p => p.id === id)
    if (!post) return

    post.read = true
    if (e.target.tagName === 'BUTTON') {
      watchedState.ui.modalPostId = id
    }
  })

  const validate = (url) => {
    const urls = state.feeds.map(feed => feed.url)
    return buildSchema(urls).validate(url)
  }

  // polling
  const startPolling = () => {
    const run = () => {
      const existingLinks = new Set(state.posts.map(p => p.link))

      state.feeds.forEach((feed) => {
        checkForUpdates(feed.url, existingLinks)
          .then((newPosts) => {
            if (newPosts.length === 0) return

            const normalized = newPosts.map(post => ({
              ...post,
              id: crypto.randomUUID(),
              feedId: feed.id,
              read: false,
            }))

            watchedState.posts.unshift(...normalized)
          })
          .catch(() => null)
      })

      setTimeout(run, 5000)
    }

    run()
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = new FormData(e.target).get('url').trim()

    watchedState.form.error = null
    watchedState.form.status = 'sending'

    validate(url)
      .then(() => loadRss(url))
      .then(({ feed, posts }) => {
        const feedId = crypto.randomUUID()

        watchedState.feeds.push({
          id: feedId,
          url,
          title: feed.title,
          description: feed.description,
        })

        const normalizedPosts = posts.map(post => ({
          ...post,
          id: crypto.randomUUID(),
          feedId,
          read: false,
        }))

        watchedState.posts.unshift(...normalizedPosts)
        watchedState.form.status = 'success'

        elements.input.value = ''
        elements.input.focus()

        if (state.feeds.length === 1) {
          startPolling()
        }
      })
      .catch((err) => {
        watchedState.form.status = 'error'

        let errorKey

        // yup
        if (err.name === 'ValidationError') {
          errorKey = `form.errors.${err.message}`
        }
        // rss
        else if (err.message === 'network') errorKey = 'form.errors.network'
        else if (err.message === 'timeout') errorKey = 'form.errors.timeout'
        else if (err.message === 'invalidRss') errorKey = 'form.errors.invalidRss'
        else if (err.message === 'emptyResponse') errorKey = 'form.errors.emptyResponse'
        else {
          errorKey = 'form.errors.unknown'
        }

        watchedState.form.error = errorKey
      })
  })
}
