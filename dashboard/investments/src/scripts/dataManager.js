// src/scripts/dataManager.js

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

const priceHistoryData = [
    { month: sampleDates[0], price: 1.00 },
    { month: sampleDates[1], price: 1.05 },
    { month: sampleDates[2], price: 1.15 },
    { month: sampleDates[3], price: 1.25 },
    { month: sampleDates[4], price: 1.30 },
    { month: sampleDates[5], price: CURRENT_SHARE_PRICE }, // Current price is the last point
];

const defaultData = {
    sharesOwned: 0,
    totalInvested: 0, // Total USD ever put in
    sharesSold: 0,
    totalSoldValue: 0, // Total USD received from sales
    accumulatedReturn: 0, // Total return earned in USD
    transactions: [], // { type: 'buy'/'sell', date: ISOString, shares: number, pricePerShare: number, amountUSD?: number, valueUSD?: number }
    monthlyReturns: [], // { month: 'YYYY-MM', returnAmount: number, sharesAtStartOfMonth: number }
    priceHistory: priceHistoryData, // Store static history here too
    currentSharePrice: CURRENT_SHARE_PRICE,
    annualReturnRate: ANNUAL_RETURN_RATE,
};

/**
 * Loads investment data from localStorage. Returns default data if not found or if running on server.
 * @returns {object} The investment data.
 */
export function loadData() {
    // Check if localStorage is available (not on server-side rendering)
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    if (isLocalStorageAvailable) {
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
    }
    // Return default data if nothing is stored, an error occurs, or we're on the server
    return { ...defaultData };
}

/**
 * Saves the provided investment data to localStorage.
 * @param {object} data The investment data to save.
 */
export function saveData(data) {
    // Check if localStorage is available (not on server-side rendering)
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    if (isLocalStorageAvailable) {
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
    } else {
        console.log("localStorage not available, data not saved");
    }
}

/**
 * Adds a new transaction and updates summary figures.
 * @param {'buy' | 'sell'} type The type of transaction.
 * @param {number} shares The number of shares involved.
 * @param {number} pricePerShare The price per share at the time of transaction.
 * @param {number} [amountUSD] The total USD amount for a 'buy' transaction.
 * @param {object} [details] Additional details about the transaction (asset name, type, etc.).
 */
export function addTransaction(type, shares, pricePerShare, amountUSD, details = {}) {
    const data = loadData();
    const transaction = {
        type,
        date: new Date().toISOString(),
        shares: Number(shares.toFixed(4)), // Store with precision
        pricePerShare,
        // Incluir detalles adicionales de la transacción
        assetName: details.assetName || 'Default Asset',
        assetType: details.assetType || 'unknown',
        paymentMethod: details.paymentMethod || 'unknown'
    };

    if (type === 'buy') {
        if (!amountUSD || amountUSD < 10) {
             console.error("Invalid buy amount");
             return false; // Indicate failure
        }
        transaction.amountUSD = Number(amountUSD.toFixed(2));
        data.sharesOwned += transaction.shares;
        data.totalInvested += transaction.amountUSD;
    } else if (type === 'sell') {
        if (shares <= 0 || shares > data.sharesOwned) {
            console.error("Invalid sell amount");
            return false; // Indicate failure
        }
        transaction.valueUSD = Number((shares * pricePerShare).toFixed(2));
        data.sharesOwned -= transaction.shares;
        data.sharesSold += transaction.shares;
        data.totalSoldValue += transaction.valueUSD;
    } else {
        console.error("Unknown transaction type");
        return false; // Indicate failure
    }

    // Round sharesOwned to avoid floating point issues after operations
    data.sharesOwned = Number(data.sharesOwned.toFixed(4));

    data.transactions.push(transaction);
    saveData(data);
    return true; // Indicate success
}

// --- Helper Functions (can be expanded) ---

/**
 * Calculates the current total value of owned shares.
 * @param {object} data The investment data.
 * @returns {number} Total value in USD.
 */
export function calculateTotalAssetValue(data) {
    return data.sharesOwned * data.currentSharePrice;
}

/**
 * Placeholder for calculating and adding monthly returns.
 * In a real app, this might run periodically or be triggered manually.
 * This is a simplified example.
 */
export function processMonthlyReturn() {
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