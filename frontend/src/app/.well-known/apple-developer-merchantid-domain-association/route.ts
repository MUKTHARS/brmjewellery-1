import { NextResponse } from 'next/server';

// Apple Pay requires this file to be served at:
// /.well-known/apple-developer-merchantid-domain-association
//
// Replace the APPLE_PAY_DOMAIN_ASSOCIATION env var with the content of the
// file downloaded from your Stripe Dashboard:
// Stripe Dashboard → Settings → Payment methods → Apple Pay → Add domain
export async function GET() {
  const content = process.env.APPLE_PAY_DOMAIN_ASSOCIATION;
  if (!content) {
    return new NextResponse('Apple Pay domain association not configured', { status: 404 });
  }
  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
