import { VercelRequest, VercelResponse } from '@vercel/node';
import { ksefApiBaseUrls, corsHeaders, handleCors, assertOk, handleError } from '../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const { environment = 'demo', referenceNumber } = req.query;

  if (!['demo', 'prod'].includes(environment as string)) {
    return res.status(400).json({ message: 'Invalid environment' });
  }

  if (!referenceNumber) {
    return res.status(400).json({ message: 'Reference number is required' });
  }

  try {
    const baseUrl = ksefApiBaseUrls[environment as 'demo' | 'prod'];
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const response = await fetch(`${baseUrl}/auth/${encodeURIComponent(referenceNumber as string)}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    await assertOk(response, 'Failed to read KSeF authentication status.');

    const authStatus = await response.json();

    res.status(200).json(authStatus);
  } catch (error) {
    handleError(error, res);
  }
}
