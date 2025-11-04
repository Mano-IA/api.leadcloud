import * as Joi from 'joi';

export const configSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development','production','test').default('production'),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  META_VERIFY_TOKEN: Joi.string().required(),
  WHATSAPP_APP_SECRET: Joi.string().required(),
  META_APP_SECRET: Joi.string().required(),
});
