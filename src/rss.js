import axios from 'axios'
import parseRss from './parser.js'

const TIMEOUT = 10000

const buildProxyUrl = url =>
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`

// LOAD RSS
export const loadRss = url =>
  axios.get(buildProxyUrl(url), {
    timeout: TIMEOUT,
    validateStatus: status => status < 500,
  })
    .then((res) => {
      if (!res.data?.contents) {
        throw new Error('rss.errors.emptyResponse')
      }

      return parseRss(res.data.contents)
    })
    .catch((err) => {
      if (err.code === 'ECONNABORTED') {
        throw new Error('rss.errors.timeout')
      }

      if (err instanceof Error && err.message.startsWith('rss.errors.')) {
        throw err
      }

      throw new Error('rss.errors.network')
    })

// POLLING
export const checkForUpdates = (url, existingLinks) =>
  axios.get(buildProxyUrl(url), { timeout: TIMEOUT })
    .then((res) => {
      if (!res.data?.contents) return []

      const { posts } = parseRss(res.data.contents)

      return posts.filter(post => !existingLinks.has(post.link))
    })
    .catch(() => [])
