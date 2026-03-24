import { FormEvent, useEffect, useState } from "react";
import { useDownloadInvoices } from "./hooks/useDownloadInvoices";
import type { DownloadInvoicesRequest } from "./types";

function generateMonthLabels(): Array<{
  label: string;
  dateFrom: string;
  dateTo: string;
}> {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    const monthNames: Record<number, string> = {
      0: "Styczeń",
      1: "Luty",
      2: "Marzec",
      3: "Kwiecień",
      4: "Maj",
      5: "Czerwiec",
      6: "Lipiec",
      7: "Sierpień",
      8: "Wrzesień",
      9: "Październik",
      10: "Listopad",
      11: "Grudzień",
    };

    months.push({
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      dateFrom: date.toISOString(),
      dateTo: new Date(nextMonth.getTime() - 1000).toISOString(),
    });
  }

  return months;
}

const monthLabels = generateMonthLabels();
const defaultMonth = monthLabels[1]; // Poprzedni miesiąc

function App() {
  const [showQA, setShowQA] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [contextType, setContextType] = useState<
    "Nip" | "InternalId" | "NipVatUe" | "PeppolId"
  >("Nip");
  const [contextValue, setContextValue] = useState("");
  const [environment, setEnvironment] = useState<"demo" | "prod">("demo");
  const [subjectType, setSubjectType] = useState<
    "Subject1" | "Subject2" | "Subject3" | "SubjectAuthorized"
  >("Subject1");
  const [dateType, setDateType] = useState<
    "Issue" | "Invoicing" | "PermanentStorage"
  >("Invoicing");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth.label);
  const [format, setFormat] = useState<"xml" | "pdf">("xml");

  const {
    mutate: downloadInvoices,
    isPending,
    isSuccess,
    isError,
    error: downloadError,
    reset: resetDownload,
  } = useDownloadInvoices();


  const selectedMonthData =
    monthLabels.find((m) => m.label === selectedMonth) || defaultMonth;

  useEffect(() => {
    if (isSuccess) {
      // reset mutation state po 8s żeby komunikat sukcesu zniknął
      const id = setTimeout(() => resetDownload(), 8000);
      return () => clearTimeout(id);
    }
  }, [isSuccess, resetDownload]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();


    const request: DownloadInvoicesRequest = {
      environment,
      token,
      contextType,
      contextValue,
      subjectType,
      dateType,
      dateFrom: selectedMonthData.dateFrom,
      dateTo: selectedMonthData.dateTo,
      format,
      email: email.trim() || undefined,
    };

    downloadInvoices(request, {
      onSuccess: (result) => {
        const objectUrl = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
    });
  }


  return (
    <div className="page-shell">
      <header className="hero minimal-hero">
        <div className="hero-row">
          <span className="eyebrow">KSeFast</span>
          <h1>Pobierz faktury z KSeF</h1>
          <button
            className="qa-toggle-btn icon-btn"
            type="button"
            aria-label={showQA ? "Ukryj Q&A" : "Pokaż Q&A"}
            onClick={() => setShowQA((v) => !v)}
          >
            <span aria-hidden="true">?</span>
          </button>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel form-panel">
          <form className="download-form" onSubmit={handleSubmit}>
            <label>
              <span>Środowisko</span>
              <select
                value={environment}
                onChange={(event) =>
                  setEnvironment(event.target.value as "demo" | "prod")
                }
              >
                <option value="demo">Demo</option>
                <option value="prod">Produkcja</option>
              </select>
            </label>

            <label>
              <span>Token KSeF</span>
              <textarea
                rows={4}
                value={token}
                onChange={(event) => {
                  setToken(event.target.value);
                }}
                placeholder="Wklej token KSeF"
                required
              />
            </label>

            <div className="two-columns">
              <label>
                <span>Typ kontekstu</span>
                <select
                  value={contextType}
                  onChange={(event) =>
                    setContextType(
                      event.target.value as
                        | "Nip"
                        | "InternalId"
                        | "NipVatUe"
                        | "PeppolId",
                    )
                  }
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
                  onChange={(event) =>
                    setSubjectType(
                      event.target.value as
                        | "Subject1"
                        | "Subject2"
                        | "Subject3"
                        | "SubjectAuthorized",
                    )
                  }
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
                  onChange={(event) =>
                    setDateType(
                      event.target.value as
                        | "Issue"
                        | "Invoicing"
                        | "PermanentStorage",
                    )
                  }
                >
                  <option value="Invoicing">Przyjęcie w KSeF</option>
                  <option value="Issue">Data wystawienia</option>
                  <option value="PermanentStorage">Trwały zapis</option>
                </select>
              </label>
            </div>

            <label>
              <span>Okres (miesiąc)</span>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                {monthLabels.map((month) => (
                  <option key={month.label} value={month.label}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>

            <div
              className="format-switcher"
              role="radiogroup"
              aria-label="Format eksportu"
            >
              <button
                className={format === "xml" ? "is-active" : ""}
                type="button"
                onClick={() => setFormat("xml")}
              >
                XML ZIP
              </button>
              <button
                className={format === "pdf" ? "is-active" : ""}
                type="button"
                onClick={() => setFormat("pdf")}
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

            <button
              className="primary-button"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Pobieranie…" : "Pobierz paczkę"}
            </button>
          </form>

          {isSuccess ? (
            <p className="status success">
              ✓ Paczka została pobrana. Dane nigdy nie opuszczają Twojej
              przeglądarki.
            </p>
          ) : null}
          {isError ? (
            <p className="status error">
              {downloadError?.message ?? "Wystąpił nieznany błąd."}
            </p>
          ) : null}
        </section>

        <aside className={`qa-aside${showQA ? ' show' : ''}`}>
          <section className="qa-section">
            <h2>Q&A / Instrukcje</h2>
            <div className="panel">
              <h3>Jak to działa?</h3>
              <ol className="steps">
                <li>Wszystkie operacje odbywają się w Twojej przeglądarce.</li>
                <li>Token nigdy nie jest wysyłany na zewnętrzne serwery.</li>
                <li>XML pobierany jest bezpośrednio z API KSeF.</li>
                <li>Paczka jest tworzona lokalnie i pobierana na Twój komputer.</li>
              </ol>
            </div>
            <div className="panel">
              <h3>Prywatność przede wszystkim</h3>
              <p>Narzędzie działa z technologią Edge Computing. Kod przesyłający Twoje dane jest publiczny, nie posiada połączenia z bazą danych i fizycznie nie ma miejsca, w którym mógłby zapisać Twój token.</p>
              <p><strong>Każde zapytanie jest izolowane i niszczone natychmiast po wysłaniu faktury do Twojej przeglądarki.</strong></p>
            </div>
            <div className="panel accent-panel">
              <h3>Kup nam kawę</h3>
              <p>Sekcja jest gotowa pod podpięcie docelowego linku wsparcia. Na tym etapie zostawiliśmy ją celowo prostą.</p>
            </div>
            <div className="panel">
              <h3>FAQ</h3>
              <ul>
                <li>Token trzymany wyłącznie w Twojej przeglądarce podczas sesji.</li>
                <li>Prosty eksport XML lub PDF.</li>
                <li>Bez przesyłania danych na zewnętrzne serwery.</li>
                <li>Bezpośrednia komunikacja z API KSeF.</li>
                <li>Jedna paczka obsługuje maksymalnie 50 faktur.</li>
                <li>KSeF wymaga nie tylko tokena, ale też identyfikatora kontekstu logowania, np. NIP-u firmy.</li>
              </ul>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
