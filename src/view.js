import onChange from 'on-change'
import { Modal } from 'bootstrap'

export default (state, elements, i18n) => {
  const modalEl = document.getElementById('modal')
  const modal = Modal.getOrCreateInstance(modalEl)

  return onChange(state, (path) => {
    if (path === 'rss.feeds') {
      renderFeeds(state.rss.feeds, elements.feeds, i18n)
    }

    if (path === 'rss.posts' || path.startsWith('rss.posts.')) {
      renderPosts(state.rss.posts, elements.posts, i18n)
    }

    if (path.startsWith('form.') || path.startsWith('rss.')) {
      updateForm(state.form, state.rss, elements, i18n)
    }

    if (path === 'ui.modalPostId') {
      renderModal(state, modalEl, modal)
    }
  })
}

// FORM
const updateForm = (form, rss, elements, i18n) => {
  const submitButton = elements.form.querySelector('button[type="submit"]')

  elements.feedback.classList.remove('text-danger', 'text-success')

  // ошибки формы
  if (form.error) {
    elements.input.classList.add('is-invalid')
    elements.feedback.textContent = i18n.t(form.error)
    elements.feedback.classList.add('text-danger')
  }
  // ошибки rss
  else if (rss.error) {
    elements.input.classList.remove('is-invalid')
    elements.feedback.textContent = i18n.t(rss.error)
    elements.feedback.classList.add('text-danger')
  }
  // загрузка
  else if (rss.status === 'loading') {
    elements.input.classList.remove('is-invalid')
    elements.feedback.textContent = i18n.t('form.status.sending')
    elements.feedback.classList.add('text-success')
  }
  // успех
  else if (form.status === 'success') {
    elements.input.classList.remove('is-invalid')
    elements.feedback.textContent = i18n.t('form.status.success')
    elements.feedback.classList.add('text-success')
  }
  else {
    elements.input.classList.remove('is-invalid')
    elements.feedback.textContent = ''
  }

  submitButton.disabled
    = form.status === 'sending' || rss.status === 'loading'
}

// FEEDS
const renderFeeds = (feeds, container, i18n) => {
  if (!container.querySelector('ul')) {
    container.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${i18n.t('ui.feeds')}</h2>
        </div>
        <ul class="list-group border-0 rounded-0"></ul>
      </div>
    `
  }

  const ul = container.querySelector('ul')
  ul.innerHTML = ''

  feeds.forEach((feed) => {
    const li = document.createElement('li')
    li.className = 'list-group-item border-0 border-end-0'

    li.innerHTML = `
      <h3 class="h6 m-0">${feed.title}</h3>
      <p class="m-0 small text-black-50">${feed.description}</p>
    `

    ul.append(li)
  })
}

// POSTS
const renderPosts = (posts, container, i18n) => {
  if (!container.querySelector('ul')) {
    container.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${i18n.t('ui.posts')}</h2>
        </div>
        <ul class="list-group border-0 rounded-0"></ul>
      </div>
    `
  }

  const ul = container.querySelector('ul')
  ul.innerHTML = ''

  posts.forEach((post) => {
    const li = document.createElement('li')
    li.className
      = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    const link = document.createElement('a')
    link.href = post.link
    link.textContent = post.title
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.dataset.id = post.id
    link.classList.add(post.read ? 'fw-normal' : 'fw-bold')

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'btn btn-outline-primary btn-sm'
    button.textContent = i18n.t('ui.preview')
    button.dataset.id = post.id

    li.append(link, button)
    ul.append(li)
  })
}

// MODAL
const renderModal = (state, modalEl, modal) => {
  const post = state.rss.posts.find(p => p.id === state.ui.modalPostId)
  if (!post) return

  modalEl.querySelector('.modal-title').textContent = post.title
  modalEl.querySelector('.modal-body').textContent = post.description
  modalEl.querySelector('.full-article').href = post.link

  modal.show()
}
