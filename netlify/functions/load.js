const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function (event, context) {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const userId = event.queryStringParameters.userId;

    if (!userId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId is required' }) };
    }

    const { data, error } = await supabase
      .from('checkin_data')
      .select('state')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ state: data ? data.state : null })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};