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
    const response = await fetch(`${baseUrl}/security/public-key-certificates`);

    await assertOk(response, 'Failed to fetch KSeF public certificates.');

    const certificates = await response.json();

    res.status(200).json(certificates);
  } catch (error) {
    handleError(error, res);
  }
}
