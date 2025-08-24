// ========================================
// Currency Utilities - Multi-currency Support
// ========================================

import type { CurrencyCode, CurrencyInfo } from '../types/lists';

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export const CURRENCY_INFO: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
};

/**
 * Format a number as currency
 */
export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
  }
): string => {
  const { showSymbol = true, showCode = false, locale = 'en-US' } = options || {};
  const currency = CURRENCY_INFO[currencyCode];

  if (!currency) {
    console.warn(`Unknown currency code: ${currencyCode}`);
    return amount.toString();
  }

  try {
    // Use Intl.NumberFormat for proper localization
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });

    let formatted = formatter.format(amount);

    // If we don't want the symbol, remove it and just show the number
    if (!showSymbol) {
      formatted = amount.toFixed(currency.decimalPlaces);
    }

    // Add currency code if requested
    if (showCode && !formatted.includes(currencyCode)) {
      formatted = `${formatted} ${currencyCode}`;
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback formatting
    const symbol = showSymbol ? currency.symbol : '';
    const code = showCode ? ` ${currencyCode}` : '';
    return `${symbol}${amount.toFixed(currency.decimalPlaces)}${code}`;
  }
};

/**
 * Parse a currency string back to a number
 */
export const parseCurrency = (
  currencyString: string,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): number => {
  const currency = CURRENCY_INFO[currencyCode];
  if (!currency) {
    console.warn(`Unknown currency code: ${currencyCode}`);
    return 0;
  }

  // Remove currency symbols and codes
  const cleanString = currencyString
    .replace(currency.symbol, '')
    .replace(currencyCode, '')
    .replace(/[,\s]/g, '')
    .trim();

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyCode: CurrencyCode): string => {
  return CURRENCY_INFO[currencyCode]?.symbol || '$';
};

/**
 * Get currency name
 */
export const getCurrencyName = (currencyCode: CurrencyCode): string => {
  return CURRENCY_INFO[currencyCode]?.name || 'Unknown Currency';
};

/**
 * Get all available currencies
 */
export const getAvailableCurrencies = (): CurrencyInfo[] => {
  return Object.values(CURRENCY_INFO);
};

/**
 * Check if currency code is valid
 */
export const isValidCurrencyCode = (code: string): code is CurrencyCode => {
  return Object.keys(CURRENCY_INFO).includes(code);
};

/**
 * Convert between currencies (simplified - in real app would use exchange rates)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRate?: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // In a real app, you would fetch exchange rates from an API
  // For now, we'll use a simplified conversion or return the same amount
  if (exchangeRate) {
    return amount * exchangeRate;
  }

  console.warn('Currency conversion requires exchange rate');
  return amount;
};
