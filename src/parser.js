const parseRss = (xmlText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new Error('rss.errors.invalidRss')
  }

  const channel = doc.querySelector('channel')
  if (!channel) {
    throw new Error('rss.errors.invalidRss')
  }

  const feed = {
    title: channel.querySelector('title')?.textContent,
    description: channel.querySelector('description')?.textContent,
  }

  const posts = [...channel.querySelectorAll('item')].map(item => ({
    title: item.querySelector('title')?.textContent,
    link: item.querySelector('link')?.textContent,
    description: item.querySelector('description')?.textContent,
  }))

  return { feed, posts }
}

export default parseRss
