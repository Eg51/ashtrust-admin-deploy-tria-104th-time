import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || 'gold,silver,bitcoin,ethereum,solana';
  const vs_currencies = searchParams.get('vs_currencies') || 'usd';

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}