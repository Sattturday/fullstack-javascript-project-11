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
              required: 'Не должно быть пустым',
              invalidUrl: 'Ссылка должна быть валидным URL',
              duplicate: 'RSS уже существует',
            },
            status: {
              sending: 'Идет загрузка...',
              success: 'RSS успешно загружен',
            },
          },
          rss: {
            errors: {
              network: 'Ошибка сети',
              timeout: 'Превышено время ожидания. Сервер долго не отвечает',
              invalidRss: 'Ресурс не содержит валидный RSS',
              emptyResponse: 'Сервер вернул пустой ответ',
              offline: 'Нет подключения к интернету',
              unknown: 'Неизвестная ошибка',
            },
          },
          ui: {
            feeds: 'Фиды',
            posts: 'Посты',
            preview: 'Просмотр',
          },
        },
      },
    },
  })
