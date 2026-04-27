import { env } from './env.config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let stripe: any = null;

if (env.STRIPE_SECRET_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe');
  stripe = new Stripe(env.STRIPE_SECRET_KEY);
}
