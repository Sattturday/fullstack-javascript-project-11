import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import i18next from 'i18next'

// Построение прокси URL с отключенным кэшем
const buildProxyUrl = url =>
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`

export const loadRss = (url) => {
  const proxyUrl = buildProxyUrl(url)

  return axios.get(proxyUrl, {
    timeout: 10000, // Таймаут 10 секунд
    validateStatus: status => status < 500, // Принимаем 404, но не 500+
  })
    .then((res) => {
      // Проверяем ответ прокси
      if (!res.data || !res.data.contents) {
        throw new Error('emptyResponse')
      }
      return parseRss(res.data.contents, url)
    })
    .catch((err) => {
      // Определяем тип ошибки
      if (err.code === 'ECONNABORTED') {
        throw new Error('timeout')
      }
      if (err.message === 'invalidRss' || err.message === 'emptyResponse') {
        throw err
      }
      // Любые другие ошибки axios
      throw new Error('network')
    })
}

const parseRss = (xmlText, url) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode || !doc.querySelector('channel')) {
    throw new Error('invalidRss')
  }

  const channel = doc.querySelector('channel')
  const feedId = uuidv4()

  const feed = {
    id: feedId,
    url,
    title: channel.querySelector('title')?.textContent?.trim() || i18next.t('rss.noTitle'),
    description: channel.querySelector('description')?.textContent?.trim() || '',
  }

  const posts = [...channel.querySelectorAll('item')].map(item => ({
    id: uuidv4(),
    feedId, // Связываем с feed.id
    title: item.querySelector('title')?.textContent?.trim() || i18next.t('rss.noTitle'),
    link: item.querySelector('link')?.textContent?.trim() || '#',
    description: item.querySelector('description')?.textContent?.trim() || '',
  }))

  return { feed, posts }
}
