// Deklaracje dla @akmf/ksef-fe-invoice-converter (oficjalny generator PDF MF, CIRFMF/ksef-pdf-generator).
// Paczka nie jest publikowana w npm ani zbudowana – zależność wskazuje na źródła przypięte do commita,
// a Vite/tsx mapują alias na jej `src/index.ts` (patrz vite.config.ts i cli/tsconfig.json).
// Zgodne z AdditionalDataTypes w jej src/lib-public/types/common.types.ts.
declare module "@akmf/ksef-fe-invoice-converter" {
  export interface InvoiceAdditionalData {
    nrKSeF: string;
    /** Data nadania numeru KSeF, jak w portalu MF: DD.MM.RRRR. */
    acDate?: string;
    qrCode?: string;
    qr2Code?: string;
    isMobile?: boolean;
    watermark?: string;
  }

  export function generateInvoice(
    file: File,
    additionalData: InvoiceAdditionalData,
    formatType: "blob",
  ): Promise<Blob>;
  export function generateInvoice(
    file: File,
    additionalData: InvoiceAdditionalData,
    formatType: "base64",
  ): Promise<string>;

  export function generatePDFUPO(file: File, formatType: "blob"): Promise<Blob>;
  export function generatePDFUPO(file: File, formatType: "base64"): Promise<string>;
}
