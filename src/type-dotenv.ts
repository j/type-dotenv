import 'reflect-metadata';
import dotenv, { DotenvConfigOptions } from 'dotenv';
import { validate } from './validate';

type ClassConstructor<T = any> = { new (): T };

export type EnvVarType = 'string' | 'number' | 'boolean';

export interface EnvVarConfig {
  type?: EnvVarType;
  env?: string;
  required?: boolean;
}

export interface EnvironmentMetadata {
  property: string;
  config: EnvVarConfig;
}

const variables = new Map<string, ClassConstructor>();
export const metadata = new Map<ClassConstructor, EnvironmentMetadata[]>();
export const loaded = new Map<ClassConstructor, any>();

export function IsString(config: Omit<Partial<EnvVarConfig>, 'type'> = {}): PropertyDecorator {
  return Env({ ...config, type: 'string' });
}

export function IsBoolean(config: Omit<Partial<EnvVarConfig>, 'type'> = {}): PropertyDecorator {
  return Env({ ...config, type: 'boolean' });
}

export function IsNumber(config: Omit<Partial<EnvVarConfig>, 'type'> = {}): PropertyDecorator {
  return Env({ ...config, type: 'number' });
}

export function Env(config: EnvVarConfig = {}): PropertyDecorator {
  return function(target: any, property: string | symbol): void {
    if (!config.type) {
      const { name } = Reflect.getMetadata('design:type', target, property);

      switch (name) {
        case 'String':
          config.type = 'string';
          break;
        case 'Number':
          config.type = 'number';
          break;
        case 'Boolean':
          config.type = 'boolean';
          break;
        default:
          throw new Error(`Unsupported property type "${name}" for "${property as string}"`);
      }
    }

    if (variables.has(property as string)) {
      throw new Error(
        `Property "${property as string}" in "${
          target.constructor.name
        }" already exists in class "${variables.get(property as string).name}"`
      );
    }

    variables.set(property as string, target.constructor);

    if (!metadata.has(target.constructor)) {
      metadata.set(target.constructor, []);
    }

    const meta = metadata.get(target.constructor);
    (meta as EnvironmentMetadata[]).push({
      property: property as string,
      config: {
        ...config,
        required: typeof config.required === 'boolean' ? config.required : true
      }
    });
  };
}

export const EnvVar = Env;

export function config(options: DotenvConfigOptions): void {
  loaded.clear();
  dotenv.config(options);
}

export type PropertyNamingStrategy = (property: string) => string;

export interface LoadOptions {
  propertyNamingStrategy?: PropertyNamingStrategy;
}

// try converting property from someCase to SOME_CASE
export const snakeCaseStrategy: PropertyNamingStrategy = (property: string): string => {
  return property
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(part => part.toUpperCase())
    .join('_');
};

export function load<T = any>(Target: ClassConstructor<T>, options: LoadOptions = {}): T {
  if (loaded.has(Target)) {
    return loaded.get(Target);
  }

  const meta = metadata.get(Target);
  if (typeof meta === 'undefined') {
    throw new Error(`"${Target.name}" does not have any decorated properties`);
  }

  const target = new Target();

  const propertyNamingStrategy = options.propertyNamingStrategy || snakeCaseStrategy;

  meta.forEach(meta => {
    const { property } = meta;
    const env = meta.config.env || propertyNamingStrategy(property);

    let envKey: string;
    let value;

    // attempt to get env from naming strategy generated key, then property key,
    // then fall back with default property value
    if (typeof process.env[env] !== 'undefined') {
      value = process.env[env];
      envKey = env;
    } else if (typeof process.env[property] !== 'undefined') {
      value = process.env[property];
      envKey = property;
    } else {
      value = (target as any)[property];
      envKey = property === env ? property : `${property}" or "${env}`;
    }

    (target as any)[property] = validate(meta, envKey, value);
  });

  loaded.set(Target, target);

  return target;
}
