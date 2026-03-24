export declare function generateInvoice(
  file: File,
  additionalData: { nrKSeF: string; qrCode?: string; isMobile?: boolean },
  formatType: 'blob',
): Promise<Blob>;

export declare function generateInvoice(
  file: File,
  additionalData: { nrKSeF: string; qrCode?: string; isMobile?: boolean },
  formatType: 'base64',
): Promise<string>;

export declare function generatePDFUPO(
  file: File,
  formatType: 'blob',
): Promise<Blob>;

export declare function generatePDFUPO(
  file: File,
  formatType: 'base64',
): Promise<string>;
