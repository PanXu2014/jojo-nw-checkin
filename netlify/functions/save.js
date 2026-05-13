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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { userId, state } = JSON.parse(event.body || '{}');

    if (!userId || !state) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId and state are required' }) };
    }

    const { data, error } = await supabase
      .from('checkin_data')
      .upsert([{ user_id: userId, state }], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};