import i18next from 'i18next'

export default () =>
  i18next.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: {
        translation: {
          form: {
            errors: {
              required: 'Поле обязательно',
              invalidUrl: 'Ссылка должна быть валидным URL',
              duplicate: 'RSS уже существует',
            },
            submit: 'Добавить',
          },
        },
      },
    },
  })
