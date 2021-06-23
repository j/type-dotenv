# type-dotenv

An extremely simple typed dotenv loader.

### Usage

```typescript
import { join } from 'path';
import { config, load, IsBoolean, IsString, IsNumber } from 'type-dotenv';

class Environment {
  @IsString()
  NODE_ENV!: string;

  @IsNumber()
  PORT: number = 1337;

  @IsString()
  URL: string = 'http://localhost:1337';

  @IsBoolean()
  ENABLE_PLAYGROUND: boolean = false;

  // by default, everything is required
  @IsString({ required: false })
  ANALYTICS_KEY?: string;
}

// Same opts as `dotenv` package.
config({
  path: join(process.cwd(), '.env.development')
});

export const env = load(Environment);

console.log(env instanceof Environment) // true
```
