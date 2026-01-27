import initI18n from './i18n.js'
import app from './app.js'
import './style.css'

initI18n().then(() => {
  app()
})
