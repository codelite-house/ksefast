# Deployment na Vercel

## Wymagania

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier wystarczy)
- Node.js 20+

## Krok 1: Push na GitHub

```bash
git add .
git commit -m "feat: Add Edge Functions for privacy-first architecture"
git push origin main
```

## Krok 2: Zaloguj się na Vercel

Przejdź do [vercel.com](https://vercel.com) i zaloguj się.

## Krok 3: Importuj projekt

1. Kliknij **"Add New..."** → **"Project"**
2. Wybierz repozytorium `ksefast` z GitHub
3. Vercel automatycznie wykryje:
   - Framework: Vite
   - Build Command: `npm run build --workspace frontend`
   - Output Directory: `frontend/dist`

## Krok 4: Dodaj Environment Variables (opcjonalnie)

Jeśli chcesz różne konfiguracje dla prod/staging:

Settings → Environment Variables

```
VITE_API_BASE_URL=/api
```

*Uwaga: Domyślnie Edge Functions są już na `/api`, nie trzeba ustawiać.*

## Krok 5: Deploy

Kliknij **"Deploy"** i czekaj 2-3 minuty.

Po deployu:
- Frontend będzie dostępny pod `https://yourdomain.vercel.app`
- Edge Functions będą dostępne pod `https://yourdomain.vercel.app/api/*`
- CORS headers będą automatycznie ustawione

## Co się dzieje na Vercel?

1. Vercel buduje frontend (React + Vite)
2. Vercel kompiluje Edge Functions (TypeScript → JavaScript)
3. Wszystko deployuje na global Edge Network
4. DNS aktualizuje się

## Monitorowanie

### Logs

```bash
vercel logs
```

### Analytics

Vercel dashboard pokazuje:
- Request count
- Error rate
- Response times
- Bandwith usage

## Wersjonowanie

Każdy push na GitHub automatycznie tworzy nowy Vercel deployment:
- `main` branch → `yourdomain.vercel.app` (production)
- Inne branche → `branchname-yourdomain.vercel.app` (preview)

## Rollback

Jeśli coś pójdzie nie tak - przejdź do:

Deployments → kliknij wcześniejszą wersję → kliknij "Redeploy"

## Custom Domain

Settings → Domains

Dodaj swoją domenę i postępuj instrukcjami (DNS CNAME).

## Troubleshooting

### "Build failed"

Sprawdź logs:
```bash
vercel logs --follow
```

Typowe przyczyny:
- TypeScript errors w Edge Functions
- Brakuje `@vercel/node` w zależnościach
- Environment variables nie ustawione

Rozwiązanie:
```bash
npm install @vercel/node --save-dev
git push
```

### Edge Functions zwracają 404

Sprawdź strukturę folderów w `api/` - muszą być Named Exports Default:

```typescript
export default async function handler(req, res) {
  // ...
}
```

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
