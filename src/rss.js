import axios from 'axios'

const buildProxyUrl = url =>
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`

export const loadRss = url =>
  axios.get(buildProxyUrl(url), {
    timeout: 10000, // Таймаут 10 секунд
    validateStatus: status => status < 500, // Принимаем 404, но не 500+
  })
    .then((res) => {
      // Проверяем ответ прокси
      if (!res.data || !res.data.contents) {
        throw new Error('emptyResponse')
      }
      return parseRss(res.data.contents)
    })
    .catch((err) => {
      if (err.code === 'ECONNABORTED') {
        throw new Error('timeout')
      }
      if (err.message === 'invalidRss' || err.message === 'emptyResponse') {
        throw err
      }
      throw new Error('network')
    })

export const checkForUpdates = (url, existingLinks) =>
  axios.get(buildProxyUrl(url), { timeout: 10000 })
    .then((res) => {
      if (!res.data?.contents) return []

      const { posts } = parseRss(res.data.contents)
      return posts.filter(post => !existingLinks.has(post.link))
    })
    .catch(() => [])

const parseRss = (xmlText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new Error('invalidRss')
  }

  const channel = doc.querySelector('channel')
  if (!channel) {
    throw new Error('invalidRss')
  }

  const feed = {
    title: channel.querySelector('title')?.textContent?.trim() || '',
    description: channel.querySelector('description')?.textContent?.trim() || '',
  }

  const posts = [...channel.querySelectorAll('item')].map(item => ({
    title: item.querySelector('title')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
    description: item.querySelector('description')?.textContent?.trim() || '',
  }))

  return { feed, posts }
}
