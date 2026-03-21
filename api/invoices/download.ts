import { VercelRequest, VercelResponse } from '@vercel/node';
import { ksefApiBaseUrls, corsHeaders, handleCors, assertOk, handleError } from '../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const { environment = 'demo', ksefNumber } = req.query;

  if (!['demo', 'prod'].includes(environment as string)) {
    return res.status(400).json({ message: 'Invalid environment' });
  }

  if (!ksefNumber) {
    return res.status(400).json({ message: 'KSeF number is required' });
  }

  try {
    const baseUrl = ksefApiBaseUrls[environment as 'demo' | 'prod'];
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const response = await fetch(
      `${baseUrl}/invoices/ksef/${encodeURIComponent(ksefNumber as string)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    await assertOk(response, `Failed to download invoice ${ksefNumber}.`);

    const xml = await response.text();

    res.status(200).setHeader('Content-Type', 'application/xml').send(xml);
  } catch (error) {
    handleError(error, res);
  }
}
