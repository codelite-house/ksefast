export type EnvironmentName = 'demo' | 'prod';
export type ContextIdentifierType = 'Nip' | 'InternalId' | 'NipVatUe' | 'PeppolId';
export type SubjectType = 'Subject1' | 'Subject2' | 'Subject3' | 'SubjectAuthorized';
export type DateType = 'Issue' | 'Invoicing' | 'PermanentStorage';
export type DownloadFormat = 'xml' | 'pdf';

export interface DownloadInvoicesRequest {
  environment: EnvironmentName;
  token: string;
  contextType: ContextIdentifierType;
  contextValue: string;
  subjectType: SubjectType;
  dateType: DateType;
  dateFrom: string;
  dateTo: string;
  format: DownloadFormat;
  email?: string;
}

export interface PublicCertificateInfo {
  certificate: string;
  validFrom?: string;
  validTo?: string;
  usage?: string[];
}

export interface KsefChallengeResponse {
  challenge: string;
  timestamp: string;
  timestampMs: number;
  clientIp: string;
}

export interface KsefInitAuthResponse {
  referenceNumber: string;
  authenticationToken: {
    token: string;
    validUntil: string;
  };
}

export interface KsefOperationStatus {
  code: number;
  description: string;
  details?: string[];
}

export interface KsefAuthStatusResponse {
  status: KsefOperationStatus;
  isTokenRedeemed?: boolean | null;
}

export interface KsefTokensResponse {
  accessToken: {
    token: string;
    validUntil: string;
  };
  refreshToken: {
    token: string;
    validUntil: string;
  };
}

export interface InvoiceMetadata {
  ksefNumber: string;
  invoiceNumber: string;
  issueDate: string;
  invoicingDate: string;
  permanentStorageDate: string;
  acquisitionDate: string;
  formCode: string;
  invoiceType: string;
  currency: string;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
  hasAttachment: boolean;
  invoicingMode: string;
  isSelfInvoicing: boolean;
  invoiceHash: string;
  seller: {
    name?: string;
    nip?: string;
  };
  buyer: {
    name?: string;
    nip?: string;
  };
}

export interface QueryInvoicesResponse {
  hasMore: boolean;
  isTruncated: boolean;
  permanentStorageHwmDate?: string | null;
  invoices: InvoiceMetadata[];
}

export interface DownloadedInvoice {
  metadata: InvoiceMetadata;
  xml: string;
}
