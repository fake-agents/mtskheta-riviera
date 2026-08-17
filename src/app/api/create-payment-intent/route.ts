import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'gel' } = await request.json();
    
    // Stripe integration boilerplate
    // Uncomment and add your STRIPE_SECRET_KEY to .env.local to activate
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    */
    
    // Demo mode - return a mock response
    return NextResponse.json({ 
      clientSecret: 'demo_mode',
      message: 'Payment system in demo mode. Add STRIPE_SECRET_KEY to activate.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
