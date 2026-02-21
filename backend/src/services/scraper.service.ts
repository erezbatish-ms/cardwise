import { CompanyTypes, createScraper } from "israeli-bank-scrapers";

export interface ScrapeCredentials {
  id: string;           // תעודת זהות
  card6Digits: string;  // 6 ספרות אחרונות של הכרטיס
  password: string;     // סיסמה קבועה
  startDate: Date;
}

export interface ScrapeAccount {
  accountNumber: string;
  txns: ScrapeTransaction[];
}

export interface ScrapeTransaction {
  date: string;
  processedDate: string;
  description: string;
  originalAmount: number;
  chargedAmount: number;
  originalCurrency: string;
  memo?: string;
  installments?: {
    number: number;
    total: number;
  };
  identifier?: string;
}

export interface ScrapeResult {
  success: boolean;
  accounts: ScrapeAccount[];
  errorType?: string;
  errorMessage?: string;
}

class ScraperService {
  async scrape(credentials: ScrapeCredentials): Promise<ScrapeResult> {
    const options = {
      companyId: CompanyTypes.isracard,
      startDate: credentials.startDate,
      combineInstallments: false,
      showBrowser: false,
    };

    try {
      const scraper = createScraper(options);
      const result = await scraper.scrape({
        id: credentials.id,
        card6Digits: credentials.card6Digits,
        password: credentials.password,
      });

      if (result.success && result.accounts) {
        return {
          success: true,
          accounts: result.accounts.map((acc) => ({
            accountNumber: acc.accountNumber,
            txns: acc.txns.map((txn) => ({
              date: txn.date,
              processedDate: txn.processedDate,
              description: txn.description,
              originalAmount: txn.originalAmount,
              chargedAmount: txn.chargedAmount,
              originalCurrency: txn.originalCurrency || "ILS",
              memo: txn.memo,
              installments: txn.installments,
              identifier: txn.identifier != null ? String(txn.identifier) : undefined,
            })),
          })),
        };
      }

      return {
        success: false,
        accounts: [],
        errorType: result.errorType,
        errorMessage: result.errorMessage,
      };
    } catch (err) {
      // Never log credentials
      const message = err instanceof Error ? err.message : "Unknown scraper error";
      return {
        success: false,
        accounts: [],
        errorType: "GENERIC",
        errorMessage: message,
      };
    }
  }
}

export const scraperService = new ScraperService();
