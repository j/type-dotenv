# type-dotenv

An extremely simple typed dotenv loader.

## Usage

```typescript
import { join } from 'path';
import { config, load, Env } from 'type-dotenv';

class Environment {
  @Env({ env: 'NODE_ENV' })
  env!: string;

  @Env()
  port: number = 1337;

  @Env()
  url: string = 'http://localhost:1337';

  @Env()
  enablePlayground: boolean = false;

  // by default, everything is required
  @Env({ required: false })
  analyticsKey?: string;
}

// Same opts as `dotenv` package.. this is optional if you prefer to not use a `.env` file.
config({
  path: join(process.cwd(), '.env.development')
});

export const env = load(Environment);

console.log(env instanceof Environment) // true
```

By default, we first look for `process.env[snakeCase(propertyName)]` and then `process.env[propertyName]`.  So for property, `analyticsKey`, we
look for environment variable `ANALYTICS_KEY`, and then `analyticsKey`.

Internally, we use reflection (`reflect-metadata`) to get the property's type through typescript for .env string casting. 
Currently, we only support `string`, `boolean`, and `number`.

## Having more fun with `type-dotenv`

You can have multiple environment classes throughout your application.  It's common on your main file to load the config for
`.env` processing.

```typescript
// app.ts
import { join } from 'path';

require('type-dotenv').config({
  path: join(process.cwd(), '.env')
});

// db.service.ts
import { Env, load } from 'type-dotenv';

class DatabaseProviderOptions {
  @Env()
  dbHost: string;
  
  @Env()
  dbUsername: string;
  
  @Env()
  dbPassword: string;
}

class DatabaseProvider {
  protected options: DatabaseProviderOptions = load(DatabaseProviderOptions);
  
  // ...
}


// jwt.service.ts
import { Env, load } from 'type-dotenv';

class JwtServiceOptions {
  @Env()
  authTokenSecret: string;
}

class JwtService {
  protected options: JwtServiceOptions = load(JwtServiceOptions);
  
  // ...
}
```
