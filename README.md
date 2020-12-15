# type-dotenv

An extremely simple typed dotenv loader.

### Usage

```typescript
import { load, IsBoolean, IsString, IsNumber } from 'type-dotenv';

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

export const env = load(Environment);

// or with config (these are defaults)

export const env = load(Environment, {
    envPath: process.cwd(),
    envFile: `.env.${process.env.NODE_ENV || 'development'}`
});

console.log(env instanceof Environment) // true
```
