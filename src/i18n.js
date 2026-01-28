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
              required: 'Поле обязательно для заполнения',
              invalidUrl: 'Ссылка должна быть валидным URL',
              duplicate: 'RSS уже существует',
              network: 'Ошибка сети. Проверьте подключение к интернету',
              timeout: 'Превышено время ожидания. Сервер долго не отвечает',
              invalidRss: 'Ресурс не содержит валидный RSS',
              emptyResponse: 'Сервер вернул пустой ответ',
              offline: 'Нет подключения к интернету',
              unknown: 'Неизвестная ошибка',
            },
            status: {
              sending: 'Идет загрузка...',
              success: 'RSS успешно загружен',
            },
          },
          rss: {
            noTitle: 'Без названия',
          },
        },
      },
    },
  })
