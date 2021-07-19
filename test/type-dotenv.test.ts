import { config, load, loaded, IsString, IsNumber, IsBoolean } from '../src/type-dotenv'
import * as path from 'path'

const originalEnvVariables = {
  ...process.env
}

class Environment {
  @IsString()
  NODE_ENV!: string

  @IsString()
  STRING!: string

  @IsNumber()
  NUMBER!: number

  @IsString()
  STRING_WITH_DEFAULT: string = 'default'

  @IsNumber()
  NUMBER_WITH_DEFAULT: number = 12345

  @IsString({ required: false })
  OPTIONAL_STRING?: string

  @IsNumber({ required: false })
  OPTIONAL_NUMBER?: number

  @IsBoolean()
  BOOLEAN_AS_TRUE?: boolean

  @IsBoolean()
  BOOLEAN_AS_1?: boolean

  @IsBoolean()
  BOOLEAN_AS_FALSE?: boolean

  @IsBoolean()
  BOOLEAN_AS_0?: boolean

  @IsString()
  stringRenamed: string

  @IsString()
  stringRenamedWithDefault: string = 'string renamed default'

  @IsString()
  string_with_underscore: string

  @IsNumber()
  numberRenamed: number
}

class DatabaseEnvironment {
  @IsString()
  DATABASE: string

  @IsString()
  PASSWORD: string
}

/**
 * Dummy test
 */
describe('dotenv test', () => {
  afterEach(() => {
    loaded.clear()

    Object.keys(process.env).forEach(key => {
      delete process.env[key]
    })

    Object.keys(originalEnvVariables).forEach(key => {
      ;(process.env as any)[key] = originalEnvVariables
    })
  })

  it('parses default .env.test file', () => {
    config({ path: path.join(process.cwd(), '.env.test') })
    const env = load(Environment)

    expect(env).toBeInstanceOf(Environment)
    expect(env.NODE_ENV).toBe('test')
    expect(env.STRING).toBe('i am a string')
    expect(env.NUMBER).toBe(1337)
    expect(env.STRING_WITH_DEFAULT).toBe('default')
    expect(env.NUMBER_WITH_DEFAULT).toBe(12345)
    expect(env.OPTIONAL_STRING).toBeUndefined()
    expect(env.OPTIONAL_NUMBER).toBeUndefined()
    expect(env.BOOLEAN_AS_TRUE).toBe(true)
    expect(env.BOOLEAN_AS_1).toBe(true)
    expect(env.BOOLEAN_AS_FALSE).toBe(false)
    expect(env.BOOLEAN_AS_0).toBe(false)

    expect(env.numberRenamed).toBe(123)
    expect(env.stringRenamed).toBe('string renamed')
    expect(env.stringRenamedWithDefault).toBe('string renamed default')
    expect(env.string_with_underscore).toBe('STRING WITH UNDERSCORE')

    const database = load(DatabaseEnvironment)
    expect(database).toBeInstanceOf(DatabaseEnvironment)
    expect(database.DATABASE).toBe('some_database')
    expect(database.PASSWORD).toBe('some_password')
  })

  it('gets a loaded environment', () => {
    config({ path: path.join(process.cwd(), '.env.test') })
    const env = load(Environment)
    expect(env).toBeInstanceOf(Environment)
  })

  it('errors with invalid number', () => {
    expect(() => {
      loaded.clear()
      config({ path: path.join(__dirname, '.env.invalid_number') })
      console.log(load(Environment))
    }).toThrow('Environment variable "NUMBER" is not a number')
  })

  it('errors when loading un-decorated class', () => {
    class SomeEnvironment {}

    expect(() => {
      config({ path: path.join(process.cwd(), '.env.test') })
      load(SomeEnvironment)
    }).toThrow('"SomeEnvironment" does not have any decorated properties')
  })

  it('errors when two environments share the same key', () => {
    expect(() => {
      class StringAlreadyExists {
        @IsString()
        STRING: string
      }
      load(StringAlreadyExists)
    }).toThrow('Property "STRING" in "StringAlreadyExists" already exists in class "Environment"')
  })
})
