import axios from 'axios';

export async function analyzeUserMood(userInput: string, userVariables: any = {}, previousEntries: any[] = []) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY missing');

  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free';
  const url = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';

  const systemContent = `Analizza il testo e tutte le variabili inserite dall'utente.\nRispondi in seconda persona singolare e adatta la lingua alla lingua dell'utente.\n\nRestituisci SOLO un oggetto JSON con la seguente struttura:\n{\n  "analysis": "sintesi in una frase",\n  "score": numero da 1 (molto negativo) a 10 (molto positivo),\n  "advice": ["consiglio 1", "consiglio 2", "consiglio 3"]\n}`;

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Testo utente: ${userInput}\n\nVariabili attuali: ${JSON.stringify(userVariables)}\n\nConfronta brevemente con dati precedenti: ${JSON.stringify(previousEntries)}` }
  ];

  const body = {
    model,
    messages,
  } as any;

  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });

  const rawMessage = resp.data?.choices?.[0]?.message?.content?.trim() || resp.data?.text || JSON.stringify(resp.data);

  // Try to parse JSON, otherwise return the raw string
  try {
    return JSON.parse(rawMessage);
  } catch (err) {
    return rawMessage;
  }
}

export default analyzeUserMood;
