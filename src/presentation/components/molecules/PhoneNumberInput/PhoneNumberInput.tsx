// ========================================
// Professional International Phone Number Input Component
// ========================================

import React, { useState, useEffect, type FC } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Typography } from '../../atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';

// ========================================
// Country Data with Flags and Codes
// ========================================

export interface Country {
  readonly code: string; // ISO 3166-1 alpha-2 code
  readonly dialCode: string;
  readonly name: string;
  readonly flag: string; // Unicode emoji flag
  readonly priority?: number; // For sorting popular countries first
}

const COUNTRIES: Country[] = [
  // Popular countries first
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸', priority: 1 },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧', priority: 2 },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦', priority: 3 },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰', priority: 4 },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳', priority: 5 },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺', priority: 6 },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪', priority: 7 },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷', priority: 8 },

  // All other countries alphabetically
  { code: 'AD', dialCode: '+376', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'AF', dialCode: '+93', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AG', dialCode: '+1', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AI', dialCode: '+1', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'AL', dialCode: '+355', name: 'Albania', flag: '🇦🇱' },
  { code: 'AM', dialCode: '+374', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AO', dialCode: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AS', dialCode: '+1', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'AT', dialCode: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: 'AW', dialCode: '+297', name: 'Aruba', flag: '🇦🇼' },
  { code: 'AZ', dialCode: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BB', dialCode: '+1', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BE', dialCode: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BF', dialCode: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BG', dialCode: '+359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BI', dialCode: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: 'BJ', dialCode: '+229', name: 'Benin', flag: '🇧🇯' },
  { code: 'BL', dialCode: '+590', name: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: 'BM', dialCode: '+1', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'BN', dialCode: '+673', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BO', dialCode: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BS', dialCode: '+1', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BT', dialCode: '+975', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BW', dialCode: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BY', dialCode: '+375', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BZ', dialCode: '+501', name: 'Belize', flag: '🇧🇿' },
  { code: 'CD', dialCode: '+243', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: 'CF', dialCode: '+236', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'CG', dialCode: '+242', name: 'Republic of the Congo', flag: '🇨🇬' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'CI', dialCode: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'CK', dialCode: '+682', name: 'Cook Islands', flag: '🇨🇰' },
  { code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: 'CM', dialCode: '+237', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', dialCode: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CU', dialCode: '+53', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CV', dialCode: '+238', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'CW', dialCode: '+599', name: 'Curaçao', flag: '🇨🇼' },
  { code: 'CY', dialCode: '+357', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', dialCode: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DJ', dialCode: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'DK', dialCode: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DM', dialCode: '+1', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', dialCode: '+1', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'DZ', dialCode: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: 'EC', dialCode: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EE', dialCode: '+372', name: 'Estonia', flag: '🇪🇪' },
  { code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: 'ER', dialCode: '+291', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'ET', dialCode: '+251', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FI', dialCode: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: 'FJ', dialCode: '+679', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FK', dialCode: '+500', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: 'FM', dialCode: '+691', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'FO', dialCode: '+298', name: 'Faroe Islands', flag: '🇫🇴' },
  { code: 'GA', dialCode: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GD', dialCode: '+1', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GE', dialCode: '+995', name: 'Georgia', flag: '🇬🇪' },
  { code: 'GF', dialCode: '+594', name: 'French Guiana', flag: '🇬🇫' },
  { code: 'GG', dialCode: '+44', name: 'Guernsey', flag: '🇬🇬' },
  { code: 'GH', dialCode: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GI', dialCode: '+350', name: 'Gibraltar', flag: '🇬🇮' },
  { code: 'GL', dialCode: '+299', name: 'Greenland', flag: '🇬🇱' },
  { code: 'GM', dialCode: '+220', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GN', dialCode: '+224', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GP', dialCode: '+590', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'GQ', dialCode: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'GR', dialCode: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: 'GT', dialCode: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'GU', dialCode: '+1', name: 'Guam', flag: '🇬🇺' },
  { code: 'GW', dialCode: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', dialCode: '+592', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HK', dialCode: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HN', dialCode: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HR', dialCode: '+385', name: 'Croatia', flag: '🇭🇷' },
  { code: 'HT', dialCode: '+509', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HU', dialCode: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IL', dialCode: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: 'IM', dialCode: '+44', name: 'Isle of Man', flag: '🇮🇲' },
  { code: 'IQ', dialCode: '+964', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IR', dialCode: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: 'IS', dialCode: '+354', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'JE', dialCode: '+44', name: 'Jersey', flag: '🇯🇪' },
  { code: 'JM', dialCode: '+1', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'JO', dialCode: '+962', name: 'Jordan', flag: '🇯🇴' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'KI', dialCode: '+686', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KM', dialCode: '+269', name: 'Comoros', flag: '🇰🇲' },
  { code: 'KN', dialCode: '+1', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'KP', dialCode: '+850', name: 'North Korea', flag: '🇰🇵' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KY', dialCode: '+1', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: 'KZ', dialCode: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'LA', dialCode: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'LC', dialCode: '+1', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'LI', dialCode: '+423', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'LR', dialCode: '+231', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LS', dialCode: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LT', dialCode: '+370', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', dialCode: '+352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'LV', dialCode: '+371', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LY', dialCode: '+218', name: 'Libya', flag: '🇱🇾' },
  { code: 'MA', dialCode: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MC', dialCode: '+377', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MD', dialCode: '+373', name: 'Moldova', flag: '🇲🇩' },
  { code: 'ME', dialCode: '+382', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MF', dialCode: '+590', name: 'Saint Martin', flag: '🇲🇫' },
  { code: 'MG', dialCode: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MH', dialCode: '+692', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MK', dialCode: '+389', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'ML', dialCode: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: 'MM', dialCode: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'MN', dialCode: '+976', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'MO', dialCode: '+853', name: 'Macau', flag: '🇲🇴' },
  { code: 'MP', dialCode: '+1', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: 'MQ', dialCode: '+596', name: 'Martinique', flag: '🇲🇶' },
  { code: 'MR', dialCode: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MS', dialCode: '+1', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'MT', dialCode: '+356', name: 'Malta', flag: '🇲🇹' },
  { code: 'MU', dialCode: '+230', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MV', dialCode: '+960', name: 'Maldives', flag: '🇲🇻' },
  { code: 'MW', dialCode: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MZ', dialCode: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'NA', dialCode: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NC', dialCode: '+687', name: 'New Caledonia', flag: '🇳🇨' },
  { code: 'NE', dialCode: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: 'NF', dialCode: '+672', name: 'Norfolk Island', flag: '🇳🇫' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'NI', dialCode: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NO', dialCode: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: 'NP', dialCode: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NR', dialCode: '+674', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NU', dialCode: '+683', name: 'Niue', flag: '🇳🇺' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'OM', dialCode: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: 'PA', dialCode: '+507', name: 'Panama', flag: '🇵🇦' },
  { code: 'PE', dialCode: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: 'PF', dialCode: '+689', name: 'French Polynesia', flag: '🇵🇫' },
  { code: 'PG', dialCode: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', dialCode: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: 'PM', dialCode: '+508', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: 'PN', dialCode: '+64', name: 'Pitcairn', flag: '🇵🇳' },
  { code: 'PR', dialCode: '+1', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'PS', dialCode: '+970', name: 'Palestine', flag: '🇵🇸' },
  { code: 'PT', dialCode: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'PW', dialCode: '+680', name: 'Palau', flag: '🇵🇼' },
  { code: 'PY', dialCode: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'QA', dialCode: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RE', dialCode: '+262', name: 'Réunion', flag: '🇷🇪' },
  { code: 'RO', dialCode: '+40', name: 'Romania', flag: '🇷🇴' },
  { code: 'RS', dialCode: '+381', name: 'Serbia', flag: '🇷🇸' },
  { code: 'RU', dialCode: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', dialCode: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SB', dialCode: '+677', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'SC', dialCode: '+248', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SD', dialCode: '+249', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SE', dialCode: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SH', dialCode: '+290', name: 'Saint Helena', flag: '🇸🇭' },
  { code: 'SI', dialCode: '+386', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SJ', dialCode: '+47', name: 'Svalbard and Jan Mayen', flag: '🇸🇯' },
  { code: 'SK', dialCode: '+421', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SL', dialCode: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SM', dialCode: '+378', name: 'San Marino', flag: '🇸🇲' },
  { code: 'SN', dialCode: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: 'SO', dialCode: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: 'SR', dialCode: '+597', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SS', dialCode: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'ST', dialCode: '+239', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: 'SV', dialCode: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'SX', dialCode: '+1', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: 'SY', dialCode: '+963', name: 'Syria', flag: '🇸🇾' },
  { code: 'SZ', dialCode: '+268', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'TC', dialCode: '+1', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: 'TD', dialCode: '+235', name: 'Chad', flag: '🇹🇩' },
  { code: 'TG', dialCode: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TJ', dialCode: '+992', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TK', dialCode: '+690', name: 'Tokelau', flag: '🇹🇰' },
  { code: 'TL', dialCode: '+670', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'TM', dialCode: '+993', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'TN', dialCode: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TO', dialCode: '+676', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TR', dialCode: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TT', dialCode: '+1', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'TV', dialCode: '+688', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'TW', dialCode: '+886', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TZ', dialCode: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UA', dialCode: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'UG', dialCode: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UY', dialCode: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', dialCode: '+998', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VA', dialCode: '+379', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'VC', dialCode: '+1', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 'VE', dialCode: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VG', dialCode: '+1', name: 'British Virgin Islands', flag: '🇻🇬' },
  { code: 'VI', dialCode: '+1', name: 'U.S. Virgin Islands', flag: '🇻🇮' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'VU', dialCode: '+678', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'WF', dialCode: '+681', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'WS', dialCode: '+685', name: 'Samoa', flag: '🇼🇸' },
  { code: 'YE', dialCode: '+967', name: 'Yemen', flag: '🇾🇪' },
  { code: 'YT', dialCode: '+262', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ZM', dialCode: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', dialCode: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
];

// Sort countries by priority first, then alphabetically
const sortedCountries = COUNTRIES.sort((a, b) => {
  if (a.priority && b.priority) {
    return a.priority - b.priority;
  }
  if (a.priority && !b.priority) {
    return -1;
  }
  if (!a.priority && b.priority) {
    return 1;
  }
  return a.name.localeCompare(b.name);
});

// ========================================
// Component Props Interface
// ========================================

export interface PhoneNumberInputProps {
  readonly value?: string; // Full phone number with country code
  readonly countryCode?: string; // ISO country code
  readonly phoneNumber?: string; // Phone number without country code
  readonly onChangePhoneNumber?: (phoneNumber: string) => void;
  readonly onChangeCountry?: (country: Country) => void;
  readonly onChangeFullNumber?: (fullNumber: string) => void;
  readonly placeholder?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
  readonly style?: any;
}

// ========================================
// Phone Number Input Component
// ========================================

export const PhoneNumberInput: FC<PhoneNumberInputProps> = ({
  value = '',
  countryCode = 'US',
  phoneNumber = '',
  onChangePhoneNumber,
  onChangeCountry,
  onChangeFullNumber,
  placeholder = 'Phone number',
  error,
  disabled = false,
  autoFocus = false,
  testID = 'phone-number-input',
  accessibilityLabel = 'Phone number input',
  style,
}) => {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get('window').height;

  // State management
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return sortedCountries.find(country => country.code === countryCode) || sortedCountries[0];
  });
  const [inputValue, setInputValue] = useState(phoneNumber);
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ========================================
  // Effects
  // ========================================

  useEffect(() => {
    if (countryCode) {
      const country = sortedCountries.find(c => c.code === countryCode);
      if (country && country !== selectedCountry) {
        setSelectedCountry(country);
      }
    }
  }, [countryCode]);

  useEffect(() => {
    if (phoneNumber !== inputValue) {
      setInputValue(phoneNumber);
    }
  }, [phoneNumber]);

  // ========================================
  // Handlers
  // ========================================

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryPickerVisible(false);
    setSearchQuery('');
    onChangeCountry?.(country);

    // Create full number with new country code
    const fullNumber = `${country.dialCode}${inputValue}`;
    onChangeFullNumber?.(fullNumber);
  };

  const handlePhoneNumberChange = (text: string) => {
    // Only allow digits
    const cleanText = text.replace(/[^\d]/g, '');
    setInputValue(cleanText);
    onChangePhoneNumber?.(cleanText);

    // Create full number
    const fullNumber = `${selectedCountry.dialCode}${cleanText}`;
    onChangeFullNumber?.(fullNumber);
  };

  // ========================================
  // Filtered Countries for Search
  // ========================================

  const filteredCountries = sortedCountries.filter(
    country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========================================
  // Country List Item Renderer
  // ========================================

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        {
          backgroundColor: theme.colors.surface.background,
          borderBottomColor: theme.colors.border.primary,
        },
      ]}
      onPress={() => handleCountrySelect(item)}
      testID={`country-${item.code}`}>
      <View style={styles.countryItemContent}>
        <Typography variant='h3' style={styles.countryFlag}>
          {item.flag}
        </Typography>
        <View style={styles.countryInfo}>
          <Typography variant='body2' color={theme.colors.text.primary} style={styles.countryName}>
            {item.name}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            {item.dialCode}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ========================================
  // Render
  // ========================================

  return (
    <View style={[styles.container, style]}>
      {/* Phone Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.colors.semantic.error[500] : theme.colors.border.primary,
            backgroundColor: disabled
              ? theme.colors.surface.disabled
              : theme.colors.surface.background,
          },
        ]}>
        {/* Country Code Selector */}
        <TouchableOpacity
          style={[
            styles.countrySelector,
            {
              borderRightColor: theme.colors.border.primary,
            },
          ]}
          onPress={() => !disabled && setIsCountryPickerVisible(true)}
          disabled={disabled}
          testID={`${testID}-country-selector`}>
          <Typography variant='h6' style={styles.flagText}>
            {selectedCountry.flag}
          </Typography>
          <Typography variant='body2' color={theme.colors.text.primary} style={styles.dialCode}>
            {selectedCountry.dialCode}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary} style={styles.chevron}>
            ▼
          </Typography>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={[
            styles.phoneInput,
            {
              color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
            },
          ]}
          value={inputValue}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType='phone-pad'
          autoComplete='tel'
          textContentType='telephoneNumber'
          editable={!disabled}
          autoFocus={autoFocus}
          testID={`${testID}-number-input`}
          accessibilityLabel={accessibilityLabel}
          maxLength={15} // International phone numbers are typically max 15 digits
        />
      </View>

      {/* Error Message */}
      {error && (
        <Typography
          variant='caption'
          color={theme.colors.semantic.error[500]}
          style={styles.errorText}>
          {error}
        </Typography>
      )}

      {/* Country Picker Modal */}
      <Modal
        visible={isCountryPickerVisible}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setIsCountryPickerVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border.primary }]}>
            <Typography variant='h3' color={theme.colors.text.primary} style={styles.modalTitle}>
              Select Country
            </Typography>
            <TouchableOpacity
              onPress={() => setIsCountryPickerVisible(false)}
              style={styles.closeButton}
              testID='close-country-picker'>
              <Typography variant='h4' color={theme.colors.text.secondary}>
                ✕
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View
            style={[styles.searchContainer, { borderBottomColor: theme.colors.border.primary }]}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.colors.surface.secondary,
                  color: theme.colors.text.primary,
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder='Search countries...'
              placeholderTextColor={theme.colors.text.tertiary}
              autoCapitalize='none'
              autoCorrect={false}
              testID='country-search-input'
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={item => item.code}
            style={styles.countriesList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps='handled'
            initialNumToRender={20}
            maxToRenderPerBatch={50}
            windowSize={10}
            testID='countries-list'
          />
        </View>
      </Modal>
    </View>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden' as const,
    minHeight: 48,
  },
  countrySelector: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    minWidth: 90,
  },
  flagText: {
    fontSize: 20,
    marginRight: 6,
  },
  dialCode: {
    marginRight: 4,
    fontWeight: '500' as const,
  },
  chevron: {
    fontSize: 10,
    opacity: 0.6,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400' as const,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        paddingTop: 60, // Account for status bar
      },
      android: {
        paddingTop: 20,
      },
    }),
  },
  modalTitle: {
    fontWeight: '600' as const,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '400' as const,
  },
  countriesList: {
    flex: 1,
  },
  countryItem: {
    borderBottomWidth: 1,
  },
  countryItemContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center' as const,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontWeight: '500' as const,
    marginBottom: 2,
  },
};
