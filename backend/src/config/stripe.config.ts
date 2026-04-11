import { env } from './env.config';

// Stripe is optional — only initialised when a secret key is provided
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let stripe: any = null;

if (env.STRIPE_SECRET_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    stripe = new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
  } catch {
    // stripe package not installed — Stripe payments will be unavailable
  }
}
