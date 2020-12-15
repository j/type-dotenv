import { join } from 'path';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { validate } from './validate'

type ClassConstructor<T = any> = { new(): T };

export type EnvVarType = 'string' | 'number' | 'boolean';

export interface EnvVarConfig {
  type: EnvVarType;
  required?: boolean;
}

export interface EnvironmentMetadata {
  property: string;
  config: EnvVarConfig;
}

export const metadata = new Map<ClassConstructor, EnvironmentMetadata[]>();
export const loaded = new Map<ClassConstructor, any>();

export function IsString(config: Omit<EnvVarConfig, 'type'> = {}): PropertyDecorator {
  return EnvVar({ ...config, type: 'string' });
}

export function IsBoolean(config: Omit<EnvVarConfig, 'type'> = {}): PropertyDecorator {
  return EnvVar({ ...config, type: 'boolean' });
}

export function IsNumber(config: Omit<EnvVarConfig, 'type'> = {}): PropertyDecorator {
  return EnvVar({ ...config, type: 'number' });
}

export function EnvVar(config: EnvVarConfig): PropertyDecorator {
  return function (target: any, property: string | symbol): void {
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

export interface LoadConfig {
  envPath: string;
  envFile: string;
}

const defaultConfig: LoadConfig = {
  envPath: process.cwd(),
  envFile: `.env.${process.env.NODE_ENV || 'development'}`
};

export function load<T = any>(Target: ClassConstructor<T>, conf: Partial<LoadConfig> = {}): T {
  if (loaded.has(Target)) {
    throw new Error(`Already loaded .env for target "${Target.name}".  Use "get(Target)".`);
  }

  const meta = metadata.get(Target);
  if (typeof meta === 'undefined') {
    throw new Error(`"${Target.name}" does not have any decorated properties`);
  }

  const c: LoadConfig = {
    ...defaultConfig,
    ...conf
  };

  const parsed = parse(readFileSync(join(c.envPath, c.envFile), { encoding: 'utf-8' }).toString());

  const target = new Target();

  meta.forEach((meta) => {
    const { property } = meta;

    const value: any = validate(
      meta,
      process.env[property] || parsed[property] || (target as any)[property]
    );

    // sets the raw ENV variable within `process.env`
    if (process.env.NODE_ENV !== 'test') {
      /* istanbul ignore next */
      process.env[property] = value;
    }

    (target as any)[property] = value;
  });

  loaded.set(Target, target);

  return target;
}

export function get<T = any>(Target: ClassConstructor<T>, conf: Partial<LoadConfig> = {}): T {
  if (!loaded.has(Target)) {
    throw new Error(`Environment not loaded for "${Target.name}".  Use "load(Target)".`);
  }

  return loaded.get(Target);
}
