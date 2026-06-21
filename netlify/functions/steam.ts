import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const term = event.queryStringParameters?.term || '';

  try {
    if (term) {
      // Steam's public store search API
      const response = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=IN`
      );
      
      if (!response.ok) {
        throw new Error('Steam Search API response was not OK');
      }

      const data = await response.json();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data),
      };
    } else {
      // Fetch featured/popular games by default
      const response = await fetch(
        `https://store.steampowered.com/api/featured/?cc=IN&l=english`
      );

      if (!response.ok) {
        throw new Error('Steam Featured API response was not OK');
      }

      const data = await response.json();
      
      // Merge different categories of featured games
      const rawItems = [
        ...(data.featured_win || []),
        ...(data.large_capsules || []),
        ...(data.featured_mac || []),
        ...(data.featured_linux || [])
      ];

      // De-duplicate items by id
      const seenIds = new Set<number>();
      const uniqueItems = [];

      for (const item of rawItems) {
        if (item && item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueItems.push(item);
        }
      }

      // Map to match the client's search results parser structure
      const items = uniqueItems.map(item => ({
        id: item.id,
        name: item.name,
        price: {
          final: item.final_price
        },
        platforms: {
          windows: item.windows_available ?? true
        }
      }));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ items }),
      };
    }
  } catch (error: any) {
    console.error('Steam API Proxy Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message || 'Failed to fetch from Steam' }),
    };
  }
};
