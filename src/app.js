import i18next from 'i18next'
import initView from './view.js'
import buildSchema from './validation.js'
import { loadRss, checkForUpdates } from './rss.js'

export default () => {
  const state = {
    form: {
      status: 'idle', // idle | sending | success | error
      error: null,
    },
    rss: {
      feeds: [],
      posts: [],
      status: 'idle', // idle | loading | success | error
      error: null,
    },
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

  // POSTS
  elements.posts.addEventListener('click', (e) => {
    const { id } = e.target.dataset
    if (!id) return

    const post = watchedState.rss.posts.find(p => p.id === id)
    if (!post) return

    post.read = true

    if (e.target.tagName === 'BUTTON') {
      watchedState.ui.modalPostId = id
    }
  })

  // VALIDATION
  const validate = (url) => {
    const urls = watchedState.rss.feeds.map(feed => feed.url)
    return buildSchema(urls).validate(url)
  }

  // POLLING
  const POLLING_INTERVAL = 5000

  const pollFeeds = () => {
    const existingLinks = new Set(
      watchedState.rss.posts.map(post => post.link),
    )

    watchedState.rss.feeds.forEach((feed) => {
      checkForUpdates(feed.url, existingLinks)
        .then((newPosts) => {
          if (newPosts.length === 0) return

          const normalized = newPosts.map(post => ({
            ...post,
            id: crypto.randomUUID(),
            feedId: feed.id,
            read: false,
          }))

          watchedState.rss.posts.unshift(...normalized)
        })
        .catch(() => null)
    })
  }

  const startPolling = () => {
    pollFeeds()
    setTimeout(startPolling, POLLING_INTERVAL)
  }

  // SUBMIT
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = new FormData(e.target).get('url').trim()

    watchedState.form.error = null
    watchedState.rss.error = null

    watchedState.form.status = 'sending'

    validate(url)
      .then(() => {
        watchedState.rss.status = 'loading'
        return loadRss(url)
      })
      .then(({ feed, posts }) => {
        const feedId = crypto.randomUUID()

        watchedState.rss.feeds.push({
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

        watchedState.rss.posts.unshift(...normalizedPosts)

        watchedState.form.status = 'success'
        watchedState.rss.status = 'success'

        elements.input.value = ''
        elements.input.focus()

        if (watchedState.rss.feeds.length === 1) {
          startPolling()
        }
      })
      .catch((err) => {
        if (err.message.startsWith('form.')) {
          watchedState.form.status = 'error'
          watchedState.form.error = err.message
          return
        }

        watchedState.form.status = 'idle'
        watchedState.rss.status = 'error'
        watchedState.rss.error = err.message
      })
  })
}
