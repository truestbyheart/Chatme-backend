import { config } from 'dotenv';
import { join } from 'path';
import * as Joi from 'joi';

const environment = process.env.NODE_ENV?.trim() || 'development';

if (environment === 'development') {
  const dir = join(__dirname, '../../.env.development');
  config({ path: dir });
} else {
  config();
}

const schema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    TOKEN_SECRET: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    PORT: Joi.number().default(3000),
  })
  .unknown();

const { value: envVars, error } = schema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env, { abortEarly: false });

if (error) {
  let missingArr = error.message.split('.');
  missingArr = missingArr.map((value: string) => {
    return value.trim();
  });
  console.debug(missingArr);
  throw new Error('Missing Environment Variables');
}

export const { NODE_ENV, DATABASE_URL, TOKEN_SECRET, REDIS_URL, PORT } = envVars;
