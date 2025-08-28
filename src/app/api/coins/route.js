export async function GET() {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('CoinGecko API error:', response.statusText);
      return new Response(
        JSON.stringify({ error: `CoinGecko API error: ${response.statusText}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Unexpected CoinGecko API response:', data);
      return new Response(
        JSON.stringify({ error: 'Unexpected API response format' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format the coin data
    const coinData = data.map((coin) => ({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      priceUsd: parseFloat(coin.current_price),
      changePercent24Hr: parseFloat(coin.price_change_percentage_24h),
      volumeUsd24Hr: parseFloat(coin.total_volume),
      marketCapUsd: parseFloat(coin.market_cap),
      image: coin.image,
    }));

    return new Response(JSON.stringify(coinData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('CoinGecko API fetch timed out');
      return new Response(
        JSON.stringify({ error: 'API request timed out' }),
        { status: 504, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Error fetching CoinGecko API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
