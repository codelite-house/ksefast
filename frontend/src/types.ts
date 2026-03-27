export type EnvironmentName = "demo" | "prod";

// AuthenticationContextIdentifierType z OpenAPI spec KSeF v2
export type ContextIdentifierType =
  | "Nip"
  | "InternalId"
  | "NipVatUe"
  | "PeppolId";

// InvoiceQuerySubjectType z OpenAPI spec KSeF v2
export type SubjectType =
  | "Subject1"
  | "Subject2"
  | "Subject3"
  | "SubjectAuthorized";

// InvoiceQueryDateType z OpenAPI spec KSeF v2
export type DateType = "Issue" | "Invoicing" | "PermanentStorage";

export type DownloadFormat = "xml" | "pdf";

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
}

// Odpowiada schematowi PublicKeyCertificate z OpenAPI spec KSeF v2 (/security/public-key-certificates)
export interface PublicCertificateInfo {
  certificate: string;
  validFrom?: string;
  validTo?: string;
  usage?: string[];
}

// Odpowiada AuthenticationChallengeResponse z OpenAPI spec KSeF v2 (POST /auth/challenge)
export interface KsefChallengeResponse {
  challenge: string;
  timestamp: string;
  timestampMs: number;
}

// Body dla POST /auth/ksef-token (przez proxy POST /auth/token)
// Odpowiada InitTokenAuthenticationRequest z OpenAPI spec KSeF v2
export interface InitTokenAuthRequest {
  challenge: string;
  contextIdentifier: {
    type: ContextIdentifierType;
    value: string;
  };
  encryptedToken: string;
  authorizationPolicy: null;
}

// Odpowiada AuthenticationInitResponse z OpenAPI spec KSeF v2 (POST /auth/ksef-token)
export interface KsefInitAuthResponse {
  referenceNumber: string;
  authenticationToken: {
    token: string;
    validUntil: string;
  };
}

// Odpowiada AuthenticationOperationStatusResponse z OpenAPI spec KSeF v2 (GET /auth/{referenceNumber})
export interface KsefOperationStatus {
  code: number;
  description: string;
  details?: string[];
}

export interface KsefAuthStatusResponse {
  status: KsefOperationStatus;
  isTokenRedeemed?: boolean | null;
}

// Odpowiada AuthenticationTokensResponse z OpenAPI spec KSeF v2 (POST /auth/token/redeem)
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

// Filtry dla POST /invoices/query/metadata (przez proxy POST /invoices/metadata)
// Odpowiada InvoiceQueryFilters + InvoiceQueryDateRange z OpenAPI spec KSeF v2
export interface InvoiceQueryFilters {
  subjectType: SubjectType;
  dateRange: {
    dateType: DateType;
    from: string;
    to: string;
  };
}

// Odpowiada InvoiceMetadata z OpenAPI spec KSeF v2
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

// Odpowiada odpowiedzi POST /invoices/query/metadata z OpenAPI spec KSeF v2
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
