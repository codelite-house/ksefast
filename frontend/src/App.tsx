import { FormEvent, useMemo, useState } from 'react';

import { downloadArchive } from './api';

function toLocalInputValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const now = new Date();
const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [contextType, setContextType] = useState<'Nip' | 'InternalId' | 'NipVatUe' | 'PeppolId'>('Nip');
  const [contextValue, setContextValue] = useState('');
  const [environment, setEnvironment] = useState<'demo' | 'prod'>('demo');
  const [subjectType, setSubjectType] = useState<'Subject1' | 'Subject2' | 'Subject3' | 'SubjectAuthorized'>('Subject1');
  const [dateType, setDateType] = useState<'Issue' | 'Invoicing' | 'PermanentStorage'>('Invoicing');
  const [dateFrom, setDateFrom] = useState(toLocalInputValue(sevenDaysAgo));
  const [dateTo, setDateTo] = useState(toLocalInputValue(now));
  const [format, setFormat] = useState<'xml' | 'pdf'>('xml');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (format === 'pdf') {
      return 'PDF powstaje na serwerze z XML pobranego z KSeF przy użyciu @mdab25/ksef-pdf.';
    }

    return 'XML trafia do paczki ZIP bezpośrednio po pobraniu z KSeF.';
  }, [format]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const result = await downloadArchive({
        environment,
        token,
        contextType,
        contextValue,
        subjectType,
        dateType,
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        format,
        email: email.trim() || undefined,
      });

      const objectUrl = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setMessage('Paczka została przygotowana i pobrana. Token nie jest zapisywany po stronie aplikacji.');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Wystąpił nieznany błąd.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">KSeFast MVP</span>
          <h1>Pobierz paczkę faktur z KSeF jako XML albo PDF.</h1>
          <p>
            Wprowadź token KSeF, wskaż kontekst logowania i zakres dat, a aplikacja pobierze faktury do jednego archiwum ZIP.
          </p>
          <ul className="hero-list">
            <li>token trzymany wyłącznie w trakcie sesji żądania,</li>
            <li>prosty eksport XML lub PDF,</li>
            <li>opcjonalny e-mail do listy mailingowej.</li>
          </ul>
        </div>
        <div className="hero-card">
          <strong>Ważne</strong>
          <p>
            KSeF wymaga nie tylko tokena, ale też identyfikatora kontekstu logowania, np. NIP-u firmy.
          </p>
          <p>
            Ten MVP działa najlepiej dla wąskich zakresów dat. Jedna paczka obsługuje maksymalnie 50 faktur.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <h2>Pobierz faktury</h2>
            <p>{helperText}</p>
          </div>

          <form className="download-form" onSubmit={handleSubmit}>
            <label>
              <span>Środowisko</span>
              <select value={environment} onChange={(event) => setEnvironment(event.target.value as 'demo' | 'prod')}>
                <option value="demo">Demo</option>
                <option value="prod">Produkcja</option>
              </select>
            </label>

            <label>
              <span>Token KSeF</span>
              <textarea
                rows={4}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Wklej token KSeF"
                required
              />
            </label>

            <div className="two-columns">
              <label>
                <span>Typ kontekstu</span>
                <select
                  value={contextType}
                  onChange={(event) => setContextType(event.target.value as 'Nip' | 'InternalId' | 'NipVatUe' | 'PeppolId')}
                >
                  <option value="Nip">NIP</option>
                  <option value="InternalId">InternalId</option>
                  <option value="NipVatUe">NIP VAT UE</option>
                  <option value="PeppolId">Peppol ID</option>
                </select>
              </label>

              <label>
                <span>Wartość kontekstu</span>
                <input
                  value={contextValue}
                  onChange={(event) => setContextValue(event.target.value)}
                  placeholder="np. 1234567890"
                  required
                />
              </label>
            </div>

            <div className="two-columns">
              <label>
                <span>Rola w wyszukiwaniu</span>
                <select
                  value={subjectType}
                  onChange={(event) => setSubjectType(event.target.value as 'Subject1' | 'Subject2' | 'Subject3' | 'SubjectAuthorized')}
                >
                  <option value="Subject1">Podmiot 1 / sprzedawca</option>
                  <option value="Subject2">Podmiot 2 / nabywca</option>
                  <option value="Subject3">Podmiot 3</option>
                  <option value="SubjectAuthorized">Podmiot upoważniony</option>
                </select>
              </label>

              <label>
                <span>Typ daty</span>
                <select
                  value={dateType}
                  onChange={(event) => setDateType(event.target.value as 'Issue' | 'Invoicing' | 'PermanentStorage')}
                >
                  <option value="Invoicing">Przyjęcie w KSeF</option>
                  <option value="Issue">Data wystawienia</option>
                  <option value="PermanentStorage">Trwały zapis</option>
                </select>
              </label>
            </div>

            <div className="two-columns">
              <label>
                <span>Od</span>
                <input type="datetime-local" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} required />
              </label>

              <label>
                <span>Do</span>
                <input type="datetime-local" value={dateTo} onChange={(event) => setDateTo(event.target.value)} required />
              </label>
            </div>

            <div className="format-switcher" role="radiogroup" aria-label="Format eksportu">
              <button
                className={format === 'xml' ? 'is-active' : ''}
                type="button"
                onClick={() => setFormat('xml')}
              >
                XML ZIP
              </button>
              <button
                className={format === 'pdf' ? 'is-active' : ''}
                type="button"
                onClick={() => setFormat('pdf')}
              >
                PDF ZIP
              </button>
            </div>

            <label>
              <span>E-mail opcjonalny</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="twoj@email.pl"
              />
            </label>

            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? 'Pobieranie…' : 'Pobierz paczkę'}
            </button>
          </form>

          {message ? <p className="status success">{message}</p> : null}
          {error ? <p className="status error">{error}</p> : null}
        </section>

        <aside className="stacked-panels">
          <section className="panel">
            <h2>Jak to działa</h2>
            <ol className="steps">
              <li>Autoryzacja tokenem KSeF i kontekstem logowania.</li>
              <li>Pobranie listy faktur z wybranego zakresu.</li>
              <li>Zbudowanie paczki XML albo PDF i pobranie ZIP-a.</li>
            </ol>
          </section>

          <section className="panel">
            <h2>Kim jesteśmy</h2>
            <p>
              To prosty eksperymentalny interfejs do pobierania faktur z KSeF bez rozbudowanego wdrożenia ERP.
            </p>
          </section>

          <section className="panel accent-panel">
            <h2>Kup nam kawę</h2>
            <p>
              Sekcja jest gotowa pod podpięcie docelowego linku wsparcia. Na tym etapie zostawiliśmy ją celowo prostą.
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
