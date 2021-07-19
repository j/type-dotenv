import { validate } from '../src/validate'
import { EnvironmentMetadata } from '../src/type-dotenv'

interface TestSubject {
  meta: EnvironmentMetadata
  value: string
  result?: any
  throwsError?: string
}

describe('validate test', () => {
  ;([
    {
      meta: {
        property: 'property',
        config: {
          type: 'string'
        }
      },
      value: 'abcd',
      result: 'abcd'
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'number'
        }
      },
      value: '1337',
      result: 1337
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'string',
          required: false
        }
      },
      value: undefined,
      result: undefined
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'boolean'
        }
      },
      value: 'false',
      result: false
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'boolean'
        }
      },
      value: '0',
      result: false
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'boolean'
        }
      },
      value: 'true',
      result: true
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'boolean'
        }
      },
      value: '1',
      result: true
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'number',
          required: true
        }
      },
      throwsError: 'Environment variable "property" is not defined'
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'number'
        }
      },
      value: 'asdf',
      throwsError: 'Environment variable "property" is not a number'
    },
    {
      meta: {
        property: 'property',
        config: {
          type: 'boolean'
        }
      },
      value: 'asdf',
      throwsError: 'Environment variable "property" is not a boolean'
    }
  ] as TestSubject[]).forEach(t => {
    const expected = t.throwsError ? 'to throw error' : `to return "${t.result}"`
    const name = `Expects "${t.meta.property}" ${expected} with config "${JSON.stringify(
      t.meta.config
    )}"`

    it(name, () => {
      if (t.throwsError) {
        expect(() => validate(t.meta, t.value)).toThrowError(t.throwsError)
      } else {
        expect(validate(t.meta, t.value)).toBe(t.result)
      }
    })
  })
})
