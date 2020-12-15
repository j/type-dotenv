import { load, loaded, IsString, IsNumber, IsBoolean, get } from '../src/type-dotenv'

const originalEnvVariables = {
  ...process.env
};

class Environment {
  @IsString()
  NODE_ENV!: string;

  @IsString()
  STRING!: string;

  @IsNumber()
  NUMBER!: number;

  @IsString()
  STRING_WITH_DEFAULT: string = 'default';

  @IsNumber()
  NUMBER_WITH_DEFAULT: number = 12345;

  @IsString({ required: false })
  OPTIONAL_STRING?: string;

  @IsNumber({ required: false })
  OPTIONAL_NUMBER?: number;

  @IsBoolean()
  BOOLEAN_AS_TRUE?: boolean;

  @IsBoolean()
  BOOLEAN_AS_1?: boolean;

  @IsBoolean()
  BOOLEAN_AS_FALSE?: boolean;

  @IsBoolean()
  BOOLEAN_AS_0?: boolean;
}

/**
 * Dummy test
 */
describe("dotenv test", () => {
  afterEach(() => {
    loaded.clear();
    process.env = originalEnvVariables;
  });

  it("parses default .env.test file", () => {
    const env = load(Environment);

    expect(env).toBeInstanceOf(Environment);
    expect(env.NODE_ENV).toBe('test');
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
  });

  it("gets a loaded environment", () => {
    const env = load(Environment);

    expect(env).toBe(get(Environment));
  });

  it("errors with invalid number", () => {
    expect(() => {
      load(Environment, { envPath: __dirname, envFile: '.env.invalid_number' });
    }).toThrow('Environment variable "NUMBER" is not a number')
  });

  it("errors when loading un-decorated class", () => {
    class SomeEnvironment {}

    expect(() => {
      load(SomeEnvironment);
    }).toThrow('"SomeEnvironment" does not have any decorated properties')
  });

  it("errors when loading environment more than once", () => {
    expect(() => {
      load(Environment);
      load(Environment);
    }).toThrow('Already loaded .env for target "Environment".  Use "get(Target)".')
  });

  it("errors when getting unloaded environment", () => {
    expect(() => {
      get(Environment);
    }).toThrow('Environment not loaded for "Environment".  Use "load(Target)".')
  });
})
