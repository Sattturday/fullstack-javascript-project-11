import * as yup from 'yup'

export default existingUrls =>
  yup
    .string()
    .required('required')
    .url('invalidUrl')
    .notOneOf(existingUrls, 'duplicate')
