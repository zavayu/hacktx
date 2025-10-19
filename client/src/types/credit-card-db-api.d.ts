declare module "credit-card-db-api" {
    export interface CreditCardData {
        id?: string;
        name: string;
        issuer?: string;
        category?: string;
        network?: string;
        type?: string;
        annual_fee?: string;
        apr_rate?: string;
        benefits?: string;
        bonus_offer?: {
            dollars?: number;
            points?: number;
            miles?: number;
        };
        cashback?: Record<string, string>;
        eligibility_requirements?: {
            credit_score?: string;
        };
        [key: string]: unknown;
    }

    export default class CreditCardAPI {
        constructor(cards?: CreditCardData[]);
        filter(fn: (card: CreditCardData) => boolean): this;
        filterByName(name: string): this;
        filterByKeyword(keyword: string): this;
        filterByIssuer(issuer: string): this;
        filterByCategory(category: string): this;
        filterByNetwork(network: string): this;
        filterByType(type: string): this;
        filterByAnnualFee(min?: number, max?: number): this;
        filterByAPR(min?: number, max?: number): this;
        filterByBonus(options?: {
            dollars?: number;
            points?: number;
            miles?: number;
        }): this;
        filterByCashback(category: string, minRate?: number): this;
        filterByCreditScore(min?: number, max?: number): this;
        get(): CreditCardData[];
        getAll(): CreditCardData[];
    }
}
