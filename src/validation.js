import * as yup from 'yup'

export default existingUrls =>
  yup
    .string()
    .required('form.errors.required')
    .url('form.errors.invalidUrl')
    .notOneOf(existingUrls, 'form.errors.duplicate')
