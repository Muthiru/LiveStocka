import type { CowFormData } from '~/types'
import { rules, type Schema } from '~/utils/schemaValidation'

export const cowFormSchema: Schema<CowFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2, 'Name is too short')],
  tag_id: [rules.required('Tag ID is required')],
  breed: [],
  color: [],
  age: [],
  weight: [],
  status: [],
  birth_date: [],
  sire: [],
  dam: [],
  notes: []
}

export type LoginValues = {
  email: string
  password: string
}

export const loginSchema: Schema<LoginValues> = {
  email: [rules.required('Email is required'), rules.email()],
  password: [rules.required('Password is required'), rules.minLength(6, 'Password must be at least 6 characters')]
}

export const registerSchema: Schema<LoginValues> = loginSchema
