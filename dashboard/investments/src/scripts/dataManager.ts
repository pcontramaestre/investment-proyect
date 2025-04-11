// src/scripts/dataManager.ts
import { InvestmentData, Transaction, MonthlyReturn, PricePoint, BuyTransaction, SellTransaction } from './dataTypes';

const STORAGE_KEY = 'investmentData';
const CURRENT_SHARE_PRICE = 1.4;
const ANNUAL_RETURN_RATE = 0.15; // 15%

// --- Sample Data ---
// Generate sample dates for the last 6 months
const today = new Date();
const sampleDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (5 - i)); // Go back 5, 4, 3, 2, 1, 0 months
    d.setDate(1); // Set to the 1st of the month for consistency
    return d.toISOString().split('T')[0].substring(0, 7); // Format as YYYY-MM
}).reverse(); // Ensure oldest month is first for chart

const priceHistoryData: PricePoint[] = [
    { month: sampleDates[0], price: 1.00 },
    { month: sampleDates[1], price: 1.05 },
    { month: sampleDates[2], price: 1.15 },
    { month: sampleDates[3], price: 1.25 },
    { month: sampleDates[4], price: 1.30 },
    { month: sampleDates[5], price: CURRENT_SHARE_PRICE }, // Current price is the last point
];

// Generate sample historical transactions
const generateHistoricalTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];
    
    // Initial purchase 6 months ago
    transactions.push({
        type: 'buy',
        date: new Date(today.getFullYear(), today.getMonth() - 5, 5).toISOString(),
        shares: 50,
        pricePerShare: 1.00,
        amountUSD: 50
    });
    
    // Additional purchase 5 months ago
    transactions.push({
        type: 'buy',
        date: new Date(today.getFullYear(), today.getMonth() - 4, 10).toISOString(),
        shares: 47.619,
        pricePerShare: 1.05,
        amountUSD: 50
    });
    
    // Sell some shares 4 months ago
    transactions.push({
        type: 'sell',
        date: new Date(today.getFullYear(), today.getMonth() - 3, 15).toISOString(),
        shares: 20,
        pricePerShare: 1.15,
        valueUSD: 23
    });
    
    // Buy more 3 months ago
    transactions.push({
        type: 'buy',
        date: new Date(today.getFullYear(), today.getMonth() - 2, 8).toISOString(),
        shares: 80,
        pricePerShare: 1.25,
        amountUSD: 100
    });
    
    // Buy more 2 months ago
    transactions.push({
        type: 'buy',
        date: new Date(today.getFullYear(), today.getMonth() - 1, 20).toISOString(),
        shares: 76.923,
        pricePerShare: 1.30,
        amountUSD: 100
    });
    
    // Recent purchase
    transactions.push({
        type: 'buy',
        date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(),
        shares: 71.429,
        pricePerShare: 1.40,
        amountUSD: 100
    });
    
    return transactions;
};

// Generate sample monthly returns
const generateHistoricalReturns = (): MonthlyReturn[] => {
    const returns: MonthlyReturn[] = [];
    let cumulativeShares = 0;
    
    // Calculate returns for each month based on the price history
    for (let i = 0; i < priceHistoryData.length; i++) {
        const month = priceHistoryData[i].month;
        const price = priceHistoryData[i].price;
        
        // Estimate shares owned at the start of this month based on transactions
        if (i === 0) {
            cumulativeShares = 50; // First month after initial purchase
        } else if (i === 1) {
            cumulativeShares = 97.619; // After second purchase
        } else if (i === 2) {
            cumulativeShares = 77.619; // After first sale
        } else if (i === 3) {
            cumulativeShares = 157.619; // After third purchase
        } else if (i === 4) {
            cumulativeShares = 234.542; // After fourth purchase
        } else {
            cumulativeShares = 305.971; // After final purchase
        }
        
        // Calculate monthly return (1.25% of asset value)
        const assetValue = cumulativeShares * price;
        const monthlyRate = ANNUAL_RETURN_RATE / 12;
        const returnAmount = assetValue * monthlyRate;
        
        returns.push({
            month,
            returnAmount: Number(returnAmount.toFixed(2)),
            sharesAtStartOfMonth: Number(cumulativeShares.toFixed(4))
        });
    }
    
    return returns;
};

// Calculate totals based on historical data
const calculateHistoricalTotals = (transactions: Transaction[]): { sharesOwned: number, totalInvested: number, sharesSold: number, totalSoldValue: number } => {
    let sharesOwned = 0;
    let totalInvested = 0;
    let sharesSold = 0;
    let totalSoldValue = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'buy') {
            sharesOwned += transaction.shares;
            totalInvested += transaction.amountUSD || 0;
        } else if (transaction.type === 'sell') {
            sharesOwned -= transaction.shares;
            sharesSold += transaction.shares;
            totalSoldValue += transaction.valueUSD || 0;
        }
    });
    
    return {
        sharesOwned: Number(sharesOwned.toFixed(4)),
        totalInvested: Number(totalInvested.toFixed(2)),
        sharesSold: Number(sharesSold.toFixed(4)),
        totalSoldValue: Number(totalSoldValue.toFixed(2))
    };
};

// Generate historical data
const historicalTransactions = generateHistoricalTransactions();
const historicalReturns = generateHistoricalReturns();
const historicalTotals = calculateHistoricalTotals(historicalTransactions);

// Calculate accumulated return
const accumulatedReturn = historicalReturns.reduce((sum, item) => sum + item.returnAmount, 0);

const defaultData: InvestmentData = {
    sharesOwned: historicalTotals.sharesOwned,
    totalInvested: historicalTotals.totalInvested,
    sharesSold: historicalTotals.sharesSold,
    totalSoldValue: historicalTotals.totalSoldValue,
    accumulatedReturn: Number(accumulatedReturn.toFixed(2)),
    transactions: historicalTransactions,
    monthlyReturns: historicalReturns,
    priceHistory: priceHistoryData,
    currentSharePrice: CURRENT_SHARE_PRICE,
    annualReturnRate: ANNUAL_RETURN_RATE,
};

/**
 * Loads investment data from localStorage. Returns default data if not found.
 * @returns {InvestmentData} The investment data.
 */
export function loadData(): InvestmentData {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Ensure essential keys exist and add static data if missing
            return {
                ...defaultData, // Start with defaults to ensure all keys are present
                ...parsedData,  // Override with saved data
                priceHistory: priceHistoryData, // Always use the up-to-date static history
                currentSharePrice: CURRENT_SHARE_PRICE, // Always use the up-to-date price
                annualReturnRate: ANNUAL_RETURN_RATE, // Always use the up-to-date rate
            };
        }
    } catch (error) {
        console.error("Error loading data from localStorage:", error);
    }
    // Return default data if nothing is stored or an error occurs
    return { ...defaultData };
}

/**
 * Saves the provided investment data to localStorage.
 * @param {InvestmentData} data The investment data to save.
 */
export function saveData(data: InvestmentData): void {
    try {
        // Don't save static data back to localStorage, keep it lean
        const dataToStore = { ...data };
        delete dataToStore.priceHistory;
        delete dataToStore.currentSharePrice;
        delete dataToStore.annualReturnRate;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
    }
}

/**
 * Adds a new transaction and updates summary figures.
 * @param {'buy' | 'sell'} type The type of transaction.
 * @param {number} shares The number of shares involved.
 * @param {number} pricePerShare The price per share at the time of transaction.
 * @param {number} [amountUSD] The total USD amount for a 'buy' transaction.
 */
export function addTransaction(type: 'buy' | 'sell', shares: number, pricePerShare: number, amountUSD?: number): boolean {
    const data = loadData();
    
    // Common transaction properties
    const date = new Date().toISOString();
    const sharesFormatted = Number(shares.toFixed(4)); // Store with precision

    if (type === 'buy') {
        if (!amountUSD || amountUSD < 10) {
             console.error("Invalid buy amount");
             return false; // Indicate failure
        }
        
        // Create a buy transaction
        const buyTransaction: BuyTransaction = {
            type: 'buy',
            date,
            shares: sharesFormatted,
            pricePerShare,
            amountUSD: Number(amountUSD.toFixed(2))
        };
        
        data.sharesOwned += buyTransaction.shares;
        data.totalInvested += buyTransaction.amountUSD;
        data.transactions.push(buyTransaction);
    } else if (type === 'sell') {
        if (shares <= 0 || shares > data.sharesOwned) {
            console.error("Invalid sell amount");
            return false; // Indicate failure
        }
        
        // Create a sell transaction
        const sellTransaction: SellTransaction = {
            type: 'sell',
            date,
            shares: sharesFormatted,
            pricePerShare,
            valueUSD: Number((shares * pricePerShare).toFixed(2))
        };
        
        data.sharesOwned -= sellTransaction.shares;
        data.sharesSold += sellTransaction.shares;
        data.totalSoldValue += sellTransaction.valueUSD;
        data.transactions.push(sellTransaction);
    } else {
        console.error("Unknown transaction type");
        return false; // Indicate failure
    }

    // Round sharesOwned to avoid floating point issues after operations
    data.sharesOwned = Number(data.sharesOwned.toFixed(4));

    saveData(data);
    return true; // Indicate success
}

// --- Helper Functions (can be expanded) ---

/**
 * Calculates the current total value of owned shares.
 * @param {InvestmentData} data The investment data.
 * @returns {number} Total value in USD.
 */
export function calculateTotalAssetValue(data: InvestmentData): number {
    return data.sharesOwned * data.currentSharePrice;
}

/**
 * Placeholder for calculating and adding monthly returns.
 * In a real app, this might run periodically or be triggered manually.
 * This is a simplified example.
 */
export function processMonthlyReturn(): void {
    const data = loadData();
    const now = new Date();
    const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM

    // Check if return for this month was already processed
    const alreadyProcessed = data.monthlyReturns.some(r => r.month === currentMonthStr);

    if (!alreadyProcessed && data.sharesOwned > 0) {
        // Calculate return based on the value at the *start* of the month (or current value as proxy here)
        // A more accurate way would be to snapshot value/shares at month start.
        const monthlyRate = data.annualReturnRate / 12;
        const valueAtCalculation = calculateTotalAssetValue(data); // Using current value as proxy
        const returnAmount = valueAtCalculation * monthlyRate;

        // Add to accumulated return
        data.accumulatedReturn += returnAmount;

        // Record the monthly return event
        data.monthlyReturns.push({
            month: currentMonthStr,
            returnAmount: Number(returnAmount.toFixed(2)),
            sharesAtStartOfMonth: data.sharesOwned // Record shares for context
        });

        console.log(`Processed monthly return for ${currentMonthStr}: $${returnAmount.toFixed(2)}`);
        saveData(data);
    } else if (alreadyProcessed) {
        console.log(`Monthly return for ${currentMonthStr} already processed.`);
    } else {
         console.log(`No shares owned, skipping monthly return for ${currentMonthStr}.`);
    }
}

// Example: Add a button somewhere in your UI to trigger this manually for demo
// <button onclick="processMonthlyReturn()">Simulate Month End</button>
// Make sure to import and expose processMonthlyReturn globally if using onclick directly
// e.g., in a script tag: import { processMonthlyReturn } from '...'; window.processMonthlyReturn = processMonthlyReturn;
