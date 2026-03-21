import { VercelRequest, VercelResponse } from '@vercel/node';
import { ksefApiBaseUrls, corsHeaders, handleCors, assertOk, handleError } from '../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const { environment = 'demo' } = req.query;

  if (!['demo', 'prod'].includes(environment as string)) {
    return res.status(400).json({ message: 'Invalid environment' });
  }

  try {
    const baseUrl = ksefApiBaseUrls[environment as 'demo' | 'prod'];
    const response = await fetch(`${baseUrl}/auth/challenge`, {
      method: 'POST',
    });

    await assertOk(response, 'Failed to get KSeF auth challenge.');

    const challenge = await response.json();

    res.status(200).json(challenge);
  } catch (error) {
    handleError(error, res);
  }
}
