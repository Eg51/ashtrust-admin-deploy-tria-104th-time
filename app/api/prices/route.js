// // app/api/prices/route.js
// import { NextResponse } from 'next/server';

// export const runtime = 'nodejs';

// // ✅ Cache to store prices and reduce API calls
// let priceCache = {
//   data: null,
//   timestamp: null,
//   lastRequestTime: 0,
// };

// // ✅ Minimum time between requests (5 seconds to avoid rate limiting)
// const MIN_REQUEST_INTERVAL = 5000;
// const CACHE_DURATION = 60000; // 1 minute cache

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const ids = searchParams.get('ids') || 'gold,silver,bitcoin,ethereum,solana';
//   const vs_currencies = searchParams.get('vs_currencies') || 'usd';

//   console.log(`🔵 [prices] Fetching for IDs: ${ids}`);

//   const now = Date.now();
//   const timeSinceLastRequest = now - priceCache.lastRequestTime;

//   // ✅ Check if we have cached data that is still fresh
//   if (
//     priceCache.data &&
//     priceCache.timestamp &&
//     (now - priceCache.timestamp) < CACHE_DURATION &&
//     timeSinceLastRequest < MIN_REQUEST_INTERVAL
//   ) {
//     console.log('✅ [prices] Using cached data');
//     return NextResponse.json({
//       ...priceCache.data,
//       cached: true,
//       cachedAt: new Date(priceCache.timestamp).toISOString(),
//     });
//   }

//   // ✅ If we're making requests too quickly, return cached data
//   if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && priceCache.data) {
//     console.log('⏳ [prices] Rate limit - returning cached data');
//     return NextResponse.json({
//       ...priceCache.data,
//       cached: true,
//       cachedAt: new Date(priceCache.timestamp).toISOString(),
//       rateLimited: true,
//     });
//   }

//   const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true`;

//   try {
//     console.log(`🔵 [prices] Making API request...`);
    
//     const response = await fetch(url, {
//       headers: {
//         'Accept': 'application/json',
//         'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
//       },
//       // ✅ Cache on the server side
//       next: { revalidate: 60 },
//     });

//     priceCache.lastRequestTime = now;

//     if (!response.ok) {
//       console.error(`🔴 [prices] CoinGecko API error: ${response.status}`);
      
//       // ✅ If we have cached data, return it even if stale
//       if (priceCache.data) {
//         console.log('📦 [prices] Returning stale cached data due to API error');
//         return NextResponse.json({
//           ...priceCache.data,
//           cached: true,
//           stale: true,
//           error: `API error (${response.status}), using cached data`,
//         });
//       }

//       // ✅ Fallback to mock data
//       console.log('📊 [prices] Using fallback data');
//       const fallbackData = getFallbackPrices(ids.split(','));
//       return NextResponse.json({
//         ...fallbackData,
//         fallback: true,
//         message: 'Using fallback data due to API error',
//       });
//     }

//     const data = await response.json();
//     console.log(`✅ [prices] Success: ${Object.keys(data).length} prices fetched`);

//     // ✅ Check if we got empty data
//     if (Object.keys(data).length === 0) {
//       console.warn('⚠️ [prices] No data returned from CoinGecko');
//       if (priceCache.data) {
//         return NextResponse.json({
//           ...priceCache.data,
//           cached: true,
//           stale: true,
//           error: 'No data from API, using cached data',
//         });
//       }
//       const fallbackData = getFallbackPrices(ids.split(','));
//       return NextResponse.json({
//         ...fallbackData,
//         fallback: true,
//         message: 'Using fallback data',
//       });
//     }

//     // ✅ Update cache
//     priceCache.data = data;
//     priceCache.timestamp = now;

//     return NextResponse.json({
//       ...data,
//       cached: false,
//       fetchedAt: new Date(now).toISOString(),
//     });

//   } catch (error) {
//     console.error('🔴 [prices] Proxy error:', error);
    
//     // ✅ Return cached data if available
//     if (priceCache.data) {
//       console.log('📦 [prices] Returning cached data due to network error');
//       return NextResponse.json({
//         ...priceCache.data,
//         cached: true,
//         stale: true,
//         error: 'Network error, using cached data',
//       });
//     }

//     // ✅ Ultimate fallback
//     const fallbackData = getFallbackPrices(ids.split(','));
//     return NextResponse.json({
//       ...fallbackData,
//       fallback: true,
//       error: 'Failed to fetch prices, using fallback data',
//     });
//   }
// }

// // ✅ Fallback function to return mock data when API fails
// function getFallbackPrices(ids) {
//   const fallbacks = {
//     // ETFs
//     vti: { usd: 259.34, usd_24h_change: 1.35, usd_24h_high: 262.00, usd_24h_low: 257.00, usd_24h_vol: 6700000 },
//     sp500: { usd: 5234.56, usd_24h_change: 0.88, usd_24h_high: 5280.00, usd_24h_low: 5200.00, usd_24h_vol: 4200000000 },
//     nasdaq: { usd: 18234.12, usd_24h_change: -1.27, usd_24h_high: 18500.00, usd_24h_low: 18100.00, usd_24h_vol: 3800000000 },
//     qqq: { usd: 445.78, usd_24h_change: 1.29, usd_24h_high: 450.00, usd_24h_low: 440.00, usd_24h_vol: 52300000 },
    
//     // Commodities
//     gold: { usd: 2345.67, usd_24h_change: 1.23, usd_24h_high: 2380.00, usd_24h_low: 2320.00, usd_24h_vol: 2400000 },
//     silver: { usd: 28.92, usd_24h_change: 4.44, usd_24h_high: 30.00, usd_24h_low: 28.00, usd_24h_vol: 1100000 },
    
//     // Cryptocurrencies
//     bitcoin: { usd: 67234.89, usd_24h_change: -1.80, usd_24h_high: 68500.00, usd_24h_low: 66500.00, usd_24h_vol: 28500000000 },
//     ethereum: { usd: 3456.78, usd_24h_change: 2.65, usd_24h_high: 3550.00, usd_24h_low: 3400.00, usd_24h_vol: 15200000000 },
//     solana: { usd: 145.67, usd_24h_change: 9.26, usd_24h_high: 155.00, usd_24h_low: 140.00, usd_24h_vol: 3800000000 },
    
//     // Stocks
//     apple: { usd: 178.45, usd_24h_change: 1.33, usd_24h_high: 182.00, usd_24h_low: 176.00, usd_24h_vol: 55200000 },
//     nvidia: { usd: 845.23, usd_24h_change: 4.26, usd_24h_high: 870.00, usd_24h_low: 830.00, usd_24h_vol: 32100000 },
//     microsoft: { usd: 378.92, usd_24h_change: 1.52, usd_24h_high: 385.00, usd_24h_low: 375.00, usd_24h_vol: 28400000 },
//     amazon: { usd: 184.45, usd_24h_change: -1.25, usd_24h_high: 188.00, usd_24h_low: 182.00, usd_24h_vol: 42800000 },
//     google: { usd: 145.67, usd_24h_change: 0.85, usd_24h_high: 148.00, usd_24h_low: 143.00, usd_24h_vol: 22300000 },
//     tesla: { usd: 245.67, usd_24h_change: -3.50, usd_24h_high: 255.00, usd_24h_low: 240.00, usd_24h_vol: 78500000 },
//   };
  
//   const result = {};
//   ids.forEach(id => {
//     const cleanId = id.trim().toLowerCase();
//     if (fallbacks[cleanId]) {
//       result[cleanId] = fallbacks[cleanId];
//     } else {
//       // Random fallback for unknown assets
//       result[cleanId] = { 
//         usd: Math.round((Math.random() * 1000 + 100) * 100) / 100,
//         usd_24h_change: (Math.random() * 10 - 5),
//       };
//     }
//   });
//   return result;
// }








// app/api/prices/route.js



import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ✅ Cache to store prices and reduce API calls
let priceCache = {
  data: null,
  timestamp: null,
  lastRequestTime: 0,
};

// ✅ Minimum time between requests (5 seconds to avoid rate limiting)
const MIN_REQUEST_INTERVAL = 20000;
const CACHE_DURATION = 60000; // 1 minute cache

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || 'gold,silver,bitcoin,ethereum,solana';
  const vs_currencies = searchParams.get('vs_currencies') || 'usd';

  console.log(`🔵 [prices] Fetching for IDs: ${ids}`);

  const now = Date.now();
  const timeSinceLastRequest = now - priceCache.lastRequestTime;

  // ✅ Check if we have cached data that is still fresh
  if (
    priceCache.data &&
    priceCache.timestamp &&
    (now - priceCache.timestamp) < CACHE_DURATION &&
    timeSinceLastRequest < MIN_REQUEST_INTERVAL
  ) {
    console.log('✅ [prices] Using cached data');
    return NextResponse.json({
      ...priceCache.data,
      cached: true,
      cachedAt: new Date(priceCache.timestamp).toISOString(),
    });
  }

  // ✅ If we're making requests too quickly, return cached data
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && priceCache.data) {
    console.log('⏳ [prices] Rate limit - returning cached data');
    return NextResponse.json({
      ...priceCache.data,
      cached: true,
      cachedAt: new Date(priceCache.timestamp).toISOString(),
      rateLimited: true,
    });
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true`;

  try {
    console.log(`🔵 [prices] Making API request...`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
      },
      // ✅ Cache on the server side
      next: { revalidate: 60 },
    });

    priceCache.lastRequestTime = now;

    if (!response.ok) {
      console.error(`🔴 [prices] CoinGecko API error: ${response.status}`);
      
      // ✅ If we have cached data, return it even if stale
      if (priceCache.data) {
        console.log('📦 [prices] Returning stale cached data due to API error');
        return NextResponse.json({
          ...priceCache.data,
          cached: true,
          stale: true,
          error: `API error (${response.status}), using cached data`,
        });
      }

      // ✅ Fallback to mock data
      console.log('📊 [prices] Using fallback data');
      const fallbackData = getFallbackPrices(ids.split(','));
      return NextResponse.json({
        ...fallbackData,
        fallback: true,
        message: 'Using fallback data due to API error',
      });
    }

    const data = await response.json();
    console.log(`✅ [prices] Success: ${Object.keys(data).length} prices fetched`);

    // ✅ Check if we got empty data
    if (Object.keys(data).length === 0) {
      console.warn('⚠️ [prices] No data returned from CoinGecko');
      if (priceCache.data) {
        return NextResponse.json({
          ...priceCache.data,
          cached: true,
          stale: true,
          error: 'No data from API, using cached data',
        });
      }
      const fallbackData = getFallbackPrices(ids.split(','));
      return NextResponse.json({
        ...fallbackData,
        fallback: true,
        message: 'Using fallback data',
      });
    }

    // ✅ Update cache
    priceCache.data = data;
    priceCache.timestamp = now;

    return NextResponse.json({
      ...data,
      cached: false,
      fetchedAt: new Date(now).toISOString(),
    });

  } catch (error) {
    console.error('🔴 [prices] Proxy error:', error);
    
    // ✅ Return cached data if available
    if (priceCache.data) {
      console.log('📦 [prices] Returning cached data due to network error');
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        stale: true,
        error: 'Network error, using cached data',
      });
    }

    // ✅ Ultimate fallback
    const fallbackData = getFallbackPrices(ids.split(','));
    return NextResponse.json({
      ...fallbackData,
      fallback: true,
      error: 'Failed to fetch prices, using fallback data',
    });
  }
}

// ✅ Fallback function to return mock data when API fails
function getFallbackPrices(ids) {
  const fallbacks = {
    // ETFs
    vti: { usd: 259.34, usd_24h_change: 1.35, usd_24h_high: 262.00, usd_24h_low: 257.00, usd_24h_vol: 6700000 },
    sp500: { usd: 5234.56, usd_24h_change: 0.88, usd_24h_high: 5280.00, usd_24h_low: 5200.00, usd_24h_vol: 4200000000 },
    nasdaq: { usd: 18234.12, usd_24h_change: -1.27, usd_24h_high: 18500.00, usd_24h_low: 18100.00, usd_24h_vol: 3800000000 },
    qqq: { usd: 445.78, usd_24h_change: 1.29, usd_24h_high: 450.00, usd_24h_low: 440.00, usd_24h_vol: 52300000 },
    
    // Commodities
    gold: { usd: 2345.67, usd_24h_change: 1.23, usd_24h_high: 2380.00, usd_24h_low: 2320.00, usd_24h_vol: 2400000 },
    silver: { usd: 28.92, usd_24h_change: 4.44, usd_24h_high: 30.00, usd_24h_low: 28.00, usd_24h_vol: 1100000 },
    
    // Cryptocurrencies
    bitcoin: { usd: 67234.89, usd_24h_change: -1.80, usd_24h_high: 68500.00, usd_24h_low: 66500.00, usd_24h_vol: 28500000000 },
    ethereum: { usd: 3456.78, usd_24h_change: 2.65, usd_24h_high: 3550.00, usd_24h_low: 3400.00, usd_24h_vol: 15200000000 },
    solana: { usd: 145.67, usd_24h_change: 9.26, usd_24h_high: 155.00, usd_24h_low: 140.00, usd_24h_vol: 3800000000 },
    
    // Stocks
    apple: { usd: 178.45, usd_24h_change: 1.33, usd_24h_high: 182.00, usd_24h_low: 176.00, usd_24h_vol: 55200000 },
    nvidia: { usd: 845.23, usd_24h_change: 4.26, usd_24h_high: 870.00, usd_24h_low: 830.00, usd_24h_vol: 32100000 },
    microsoft: { usd: 378.92, usd_24h_change: 1.52, usd_24h_high: 385.00, usd_24h_low: 375.00, usd_24h_vol: 28400000 },
    amazon: { usd: 184.45, usd_24h_change: -1.25, usd_24h_high: 188.00, usd_24h_low: 182.00, usd_24h_vol: 42800000 },
    google: { usd: 145.67, usd_24h_change: 0.85, usd_24h_high: 148.00, usd_24h_low: 143.00, usd_24h_vol: 22300000 },
    tesla: { usd: 245.67, usd_24h_change: -3.50, usd_24h_high: 255.00, usd_24h_low: 240.00, usd_24h_vol: 78500000 },
  };
  
  const result = {};
  ids.forEach(id => {
    const cleanId = id.trim().toLowerCase();
    if (fallbacks[cleanId]) {
      result[cleanId] = fallbacks[cleanId];
    } else {
      // Random fallback for unknown assets
      result[cleanId] = { 
        usd: Math.round((Math.random() * 1000 + 100) * 100) / 100,
        usd_24h_change: (Math.random() * 10 - 5),
      };
    }
  });
  return result;
}