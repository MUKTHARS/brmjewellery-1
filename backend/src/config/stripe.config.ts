import Stripe from 'stripe';
import { env } from './env.config';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-02-15.acacia',
  typescript: true,
});
