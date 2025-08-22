/**
 * Currency utilities for handling different currencies throughout the app
 */

export type CurrencyCode = 'USD' | 'EUR' | 'PKR' | 'INR' | 'GBP';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
  },
  {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani Rupee',
    flag: '🇵🇰',
  },
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
  },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

/**
 * Get currency information by code
 */
export const getCurrencyByCode = (code: CurrencyCode): Currency => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
  return currency || SUPPORTED_CURRENCIES[0]; // Fallback to USD
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (amount: number, currencyCode: CurrencyCode): string => {
  const currency = getCurrencyByCode(currencyCode);
  
  // Format number with appropriate decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Different positioning for different currencies
  switch (currencyCode) {
    case 'EUR':
      return `${formattedAmount}${currency.symbol}`; // 10.50€
    case 'PKR':
    case 'INR':
      return `${currency.symbol}${formattedAmount}`; // ₨10.50, ₹10.50
    case 'GBP':
    case 'USD':
    default:
      return `${currency.symbol}${formattedAmount}`; // £10.50, $10.50
  }
};

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (currencyCode: CurrencyCode): string => {
  return getCurrencyByCode(currencyCode).symbol;
};

/**
 * Validate if currency code is supported
 */
export const isSupportedCurrency = (code: string): code is CurrencyCode => {
  return SUPPORTED_CURRENCIES.some(c => c.code === code);
};
