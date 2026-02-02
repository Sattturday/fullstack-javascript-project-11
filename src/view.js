import onChange from 'on-change'
import { Modal } from 'bootstrap'

export default (state, elements, i18n) =>
  onChange(state, (path) => {
    if (path === 'feeds') {
      renderFeeds(state.feeds, elements.feeds)
    }

    if (path === 'posts' || path.startsWith('posts.')) {
      renderPosts(state.posts, elements.posts)
    }

    if (path.startsWith('form.')) {
      updateForm(state.form, elements, i18n)
    }

    if (path === 'ui.modalPostId') {
      renderModal(state, i18n)
    }
  })

const updateForm = (form, elements, i18n) => {
  elements.input.classList.toggle('is-invalid', Boolean(form.error))
  elements.feedback.classList.toggle('text-danger', Boolean(form.error))
  elements.feedback.classList.toggle('text-success', !form.error)

  if (form.error) {
    elements.feedback.textContent = i18n.t(form.error)
  }
  else if (form.status === 'sending') {
    elements.feedback.textContent = i18n.t('form.status.sending')
    elements.feedback.classList.remove('text-danger')
    elements.feedback.classList.add('text-success')
  }
  else if (form.status === 'success') {
    elements.feedback.textContent = i18n.t('form.status.success')
    elements.feedback.classList.remove('text-danger')
    elements.feedback.classList.add('text-success')
  }
  else {
    elements.feedback.textContent = ''
  }

  elements.form.querySelector('button[type="submit"]').disabled = form.status === 'sending'
}

const renderFeeds = (feeds, container) => {
  if (!container.querySelector('ul')) {
    container.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Фиды</h2>
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

const renderPosts = (posts, container) => {
  if (!container.querySelector('ul')) {
    container.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Посты</h2>
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
    button.textContent = 'Просмотр'
    button.dataset.id = post.id

    li.append(link, button)
    ul.append(li)
  })
}

const renderModal = (state) => {
  const post = state.posts.find(p => p.id === state.ui.modalPostId)
  if (!post) return

  const modalEl = document.getElementById('modal')

  modalEl.querySelector('.modal-title').textContent = post.title
  modalEl.querySelector('.modal-body').textContent = post.description
  modalEl.querySelector('.full-article').href = post.link

  const modal = Modal.getOrCreateInstance(modalEl)
  modal.show()
}
