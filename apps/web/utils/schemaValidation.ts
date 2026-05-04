export type SchemaResult<T> = {
  data: T
  errors: Partial<Record<keyof T, string>>
  valid: boolean
}

export type FieldRule<T> = (value: unknown, allValues: T) => string | null

export type Schema<T> = {
  [K in keyof T]?: FieldRule<T>[]
}

export const rules = {
  required: <T>(message = 'This field is required'): FieldRule<T> => (value) => {
    if (value === null || value === undefined) return message
    if (typeof value === 'string' && value.trim() === '') return message
    return null
  },
  minLength: <T>(min: number, message?: string): FieldRule<T> => (value) => {
    const stringValue = typeof value === 'string' ? value : ''
    if (stringValue.trim().length < min) return message || `Must be at least ${min} characters`
    return null
  },
  email: <T>(message = 'Enter a valid email address'): FieldRule<T> => (value) => {
    const stringValue = typeof value === 'string' ? value.trim() : ''
    if (!stringValue) return null
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
    return ok ? null : message
  }
} as const

export function validateSchema<T extends Record<string, unknown>>(schema: Schema<T>, values: T): SchemaResult<T> {
  const errors: Partial<Record<keyof T, string>> = {}

  for (const key of Object.keys(schema) as (keyof T)[]) {
    const rulesForKey = schema[key] || []
    for (const rule of rulesForKey) {
      const message = rule(values[key], values)
      if (message) {
        errors[key] = message
        break
      }
    }
  }

  return {
    data: values,
    errors,
    valid: Object.keys(errors).length === 0
  }
}

