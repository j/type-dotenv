import { EnvironmentMetadata } from './type-dotenv';

function throwError(meta: EnvironmentMetadata, envKey: string) {
  throw new Error(`Environment variable "${envKey}" is not a ${meta.config.type}`);
}

export function validate(
  meta: EnvironmentMetadata,
  envKey: string,
  value: string
): undefined | string | number | boolean {
  const { config } = meta;
  const { required, type } = {
    required: true,
    ...config
  };

  if (typeof value === 'undefined') {
    if (required) {
      throw new Error(`Environment variable "${envKey}" is not defined`);
    }

    return undefined;
  }

  switch (type) {
    case 'string':
      return value;

    case 'number':
      const transformed = +value;

      if (Number.isNaN(transformed)) {
        throwError(meta, envKey);
      }

      return transformed;

    case 'boolean':
      value = value.toLowerCase();

      // valid boolean values
      if (!['true', '1', 'false', '0'].includes(value)) {
        throwError(meta, envKey);
      }

      return value === 'true' || value === '1';

    /* istanbul ignore next */
    default:
      throw new Error('Unsupported validation type');
  }
}
