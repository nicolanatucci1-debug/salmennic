const axios = require('axios');

(async () => {
  try {
    const resp = await axios.post('http://localhost:4000/api/ai/feedback', {
      summary: { mood: '3/5', notes: 'smoke test from tmp_smoke.js' }
    }, { timeout: 30000 });

    console.log('STATUS:', resp.status);
    console.log('DATA:', JSON.stringify(resp.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error('HTTP ERROR', e.response.status, e.response.statusText);
      console.error('BODY:', JSON.stringify(e.response.data, null, 2));
    } else {
      console.error('ERROR', e.message);
    }
    process.exit(1);
  }
})();
