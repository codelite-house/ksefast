import { VercelRequest, VercelResponse } from '@vercel/node';
import { ksefApiBaseUrls, corsHeaders, handleCors, assertOk, handleError } from '../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { environment = 'demo' } = req.query;

  if (!['demo', 'prod'].includes(environment as string)) {
    return res.status(400).json({ message: 'Invalid environment' });
  }

  try {
    const baseUrl = ksefApiBaseUrls[environment as 'demo' | 'prod'];
    const response = await fetch(`${baseUrl}/auth/ksef-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    await assertOk(response, 'Failed to initialize KSeF token authentication.');

    const initResponse = await response.json();

    res.status(200).json(initResponse);
  } catch (error) {
    handleError(error, res);
  }
}
