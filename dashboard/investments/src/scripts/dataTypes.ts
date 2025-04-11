// src/scripts/dataTypes.ts

/**
 * Interfaz que define la estructura de los datos de inversión
 */
export interface InvestmentData {
    sharesOwned: number;
    totalInvested: number;
    sharesSold: number;
    totalSoldValue: number;
    accumulatedReturn: number;
    transactions: Transaction[];
    monthlyReturns: MonthlyReturn[];
    priceHistory: PricePoint[];
    currentSharePrice: number;
    annualReturnRate: number;
}

/**
 * Interfaz para una transacción de compra o venta
 */
export type Transaction = BuyTransaction | SellTransaction;

/**
 * Interfaz para una transacción de compra
 */
export interface BuyTransaction {
    type: 'buy';
    date: string;
    shares: number;
    pricePerShare: number;
    amountUSD: number;
}

/**
 * Interfaz para una transacción de venta
 */
export interface SellTransaction {
    type: 'sell';
    date: string;
    shares: number;
    pricePerShare: number;
    valueUSD: number;
}

/**
 * Interfaz para un retorno mensual
 */
export interface MonthlyReturn {
    month: string;
    returnAmount: number;
    sharesAtStartOfMonth: number;
}

/**
 * Interfaz para un punto de precio en el historial
 */
export interface PricePoint {
    month: string;
    price: number;
}
