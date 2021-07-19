import { config, load, loaded, IsString, IsBoolean, IsNumber, Env } from '../src/type-dotenv';
import * as path from 'path';

const originalEnvVariables = {
  ...process.env
};

class Environment {
  @Env()
  NODE_ENV!: string;

  @Env({ env: 'NODE_ENV' })
  env!: string;

  @IsString()
  STRING!: string;

  @IsNumber()
  NUMBER!: number;

  @Env()
  STRING_WITH_DEFAULT: string = 'default';

  @Env()
  NUMBER_WITH_DEFAULT: number = 12345;

  @Env({ required: false })
  OPTIONAL_STRING?: string;

  @Env({ required: false })
  OPTIONAL_NUMBER?: number;

  @Env()
  BOOLEAN_AS_TRUE?: boolean;

  @Env()
  BOOLEAN_AS_1?: boolean;

  @IsBoolean()
  BOOLEAN_AS_FALSE?: boolean;

  @Env()
  BOOLEAN_AS_0?: boolean;

  @Env()
  stringRenamed: string;

  @Env()
  stringRenamedWithDefault: string = 'string renamed default';

  @Env()
  string_with_underscore: string;

  @Env()
  numberRenamed: number;

  @Env()
  stringRenamedFallback: string;
}

class DatabaseEnvironment {
  @IsString()
  DATABASE: string;

  @Env()
  PASSWORD: string;
}

/**
 * Dummy test
 */
describe('dotenv test', () => {
  afterEach(() => {
    loaded.clear();

    Object.keys(process.env).forEach(key => {
      delete process.env[key];
    });

    Object.keys(originalEnvVariables).forEach(key => {
      (process.env as any)[key] = originalEnvVariables;
    });
  });

  it('parses default .env.test file', () => {
    config({ path: path.join(process.cwd(), '.env.test') });
    const env = load(Environment);

    expect(env).toBeInstanceOf(Environment);
    expect(env.NODE_ENV).toBe('test');
    expect(env.env).toBe('test');
    expect(env.STRING).toBe('i am a string');
    expect(env.NUMBER).toBe(1337);
    expect(env.STRING_WITH_DEFAULT).toBe('default');
    expect(env.NUMBER_WITH_DEFAULT).toBe(12345);
    expect(env.OPTIONAL_STRING).toBeUndefined();
    expect(env.OPTIONAL_NUMBER).toBeUndefined();
    expect(env.BOOLEAN_AS_TRUE).toBe(true);
    expect(env.BOOLEAN_AS_1).toBe(true);
    expect(env.BOOLEAN_AS_FALSE).toBe(false);
    expect(env.BOOLEAN_AS_0).toBe(false);
    expect(env.numberRenamed).toBe(123);
    expect(env.stringRenamed).toBe('string renamed');
    expect(env.stringRenamedWithDefault).toBe('string renamed default');
    expect(env.string_with_underscore).toBe('STRING WITH UNDERSCORE');

    const database = load(DatabaseEnvironment);
    expect(database).toBeInstanceOf(DatabaseEnvironment);
    expect(database.DATABASE).toBe('some_database');
    expect(database.PASSWORD).toBe('some_password');
  });

  it('gets a loaded environment', () => {
    config({ path: path.join(process.cwd(), '.env.test') });
    const env = load(Environment);
    expect(env).toBeInstanceOf(Environment);
  });

  it('errors with invalid number', () => {
    expect(() => {
      loaded.clear();
      config({ path: path.join(__dirname, '.env.invalid_number') });
      console.log(load(Environment));
    }).toThrow('Environment variable "NUMBER" is not a number');
  });

  it('errors when loading un-decorated class', () => {
    class SomeEnvironment {}

    expect(() => {
      config({ path: path.join(process.cwd(), '.env.test') });
      load(SomeEnvironment);
    }).toThrow('"SomeEnvironment" does not have any decorated properties');
  });

  it('errors when two environments share the same key', () => {
    expect(() => {
      class StringAlreadyExists {
        @Env()
        STRING: string;
      }
      load(StringAlreadyExists);
    }).toThrow('Property "STRING" in "StringAlreadyExists" already exists in class "Environment"');
  });

  it('errors with unsupported types', () => {
    expect(() => {
      class InvalidEnvironment {
        @Env()
        someDate: Date;
      }
      load(InvalidEnvironment);
    }).toThrow('Unsupported property type "Date" for "someDate"');
  });
});
