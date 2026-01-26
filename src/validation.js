import * as yup from 'yup'

export default existingUrls =>
  yup
    .string()
    .required('Поле обязательно')
    .url('Некорректный URL')
    .notOneOf(existingUrls, 'RSS уже существует')
