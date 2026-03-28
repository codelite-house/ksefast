
# Deployment na produkcję

Obecnie aplikacja jest uruchamiana wyłącznie przez Docker Compose (frontend + backend Express). Instrukcje deployowania na Vercel i Edge Functions są nieaktualne i zostały usunięte.

### Timeout

Edge Functions mają limit 10 sekund. Jeśli KSeF wolno odpowiada, zwiększ timeout w `_helpers.ts`:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);
```

## Production Best Practices

1. **Monitoring** - ustaw alerts na error rate > 5%
2. **Caching** - ustaw HTTP cache headers dla image assets
3. **Rate limiting** - dodaj walidację żądań (IP whitelist)
4. **Logging** - logi trafiają do Vercel dashboard
5. **Redundancja** - zawsze push na stagingu przed production

## Uptime

Vercel gwarantuje 99.95% uptime dla Edge Functions. Do tego dodaj monitoring:

- [Better Stack](https://betterstack.com) (free tier)
- [Updown.io](https://updown.io)

```bash
# Przykład monitoring URL
https://yourdomain.vercel.app/api/security/certificates?environment=demo
```

Powinno zwrócić status 200 z JSON listą certyfikatów.

## Scaling

Vercel automatycznie skaluje Edge Functions. Nie musisz się martwić o:
- Load balancing
- Auto-scaling
- DDoS protection (Cloudflare included)

## Kosty

| Komponent | Free Tier | Pro Tier |
|-----------|-----------|----------|
| Build minutes | 100/month | 400/month |
| Edge Functions | Unlimited | Unlimited |
| Analytics | 100 events | Unlimited |
| Bandwidth | Included | Included |
| Team members | 1 | Unlimited |

**Dla startupów: Free tier wystarczy.**
