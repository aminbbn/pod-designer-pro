import { Product } from './types';

// Raw SVG Paths for Inline Rendering
// This ensures the image always loads as it is part of the DOM
export const TSHIRT_PATH = "M 160 80 Q 250 110 340 80 L 420 140 L 440 200 L 380 220 L 380 520 L 120 520 L 120 220 L 60 200 L 80 140 Z";
export const TSHIRT_DETAILS = ["M 160 80 Q 250 110 340 80"]; // Collar

export const HOODIE_PATH = "M 200 70 C 230 70 270 70 300 70 L 440 140 L 410 220 L 370 190 L 370 530 L 130 530 L 130 190 L 90 220 L 60 140 L 200 70 Z";
export const HOODIE_DETAILS = [
  "M 200 70 C 200 30 300 30 300 70", // Hood
  "M 170 420 L 330 420 L 330 530 L 170 530 Z" // Pocket
];

export const SWEATSHIRT_PATH = "M 180 80 Q 250 100 320 80 L 440 160 L 400 240 L 360 200 L 360 520 L 140 520 L 140 200 L 100 240 L 60 160 Z";
export const SWEATSHIRT_DETAILS = ["M 180 80 Q 250 100 320 80"]; // Collar

export const TANK_TOP_PATH = "M 180 80 Q 250 110 320 80 L 360 200 L 360 520 L 140 520 L 140 200 Z";
export const TANK_TOP_DETAILS = ["M 180 80 Q 250 110 320 80"]; // Collar

export const LONG_SLEEVE_PATH = "M 160 80 Q 250 110 340 80 L 460 280 L 420 320 L 380 220 L 380 520 L 120 520 L 120 220 L 80 320 L 40 280 Z";
export const LONG_SLEEVE_DETAILS = ["M 160 80 Q 250 110 340 80"]; // Collar

export const POLO_PATH = "M 160 80 L 250 120 L 340 80 L 420 140 L 440 200 L 380 220 L 380 520 L 120 520 L 120 220 L 60 200 L 80 140 Z";
export const POLO_DETAILS = [
  "M 160 80 L 250 120 L 340 80", // Collar outline
  "M 250 120 L 250 200", // Placket
  "M 240 140 A 2 2 0 1 1 240 144 A 2 2 0 1 1 240 140", // Button 1
  "M 240 170 A 2 2 0 1 1 240 174 A 2 2 0 1 1 240 170"  // Button 2
];

export const GARMENT_TYPES = [
  { id: 'tshirt', name: 'تی‌شرت', path: TSHIRT_PATH, details: TSHIRT_DETAILS },
  { id: 'hoodie', name: 'هودی', path: HOODIE_PATH, details: HOODIE_DETAILS },
  { id: 'sweatshirt', name: 'سویشرت', path: SWEATSHIRT_PATH, details: SWEATSHIRT_DETAILS },
  { id: 'tanktop', name: 'رکابی', path: TANK_TOP_PATH, details: TANK_TOP_DETAILS },
  { id: 'longsleeve', name: 'آستین بلند', path: LONG_SLEEVE_PATH, details: LONG_SLEEVE_DETAILS },
  { id: 'polo', name: 'پولوشرت', path: POLO_PATH, details: POLO_DETAILS },
];

export const PRODUCTS: Product[] = [
  {
    id: 'tshirt-classic',
    name: 'تی‌شرت نخی کلاسیک',
    type: 'تی‌شرت',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'black', name: 'مشکی', hex: '#18181b' }, // Zinc-900 (Matches surface)
      { id: 'white', name: 'سفید', hex: '#ffffff' },
      { id: 'navy', name: 'سرمه‌ای', hex: '#172554' },
      { id: 'heather', name: 'طوسی', hex: '#52525b' },
      { id: 'red', name: 'قرمز', hex: '#b91c1c' },
      { id: 'yellow', name: 'زرد', hex: '#a16207' },
    ],
    views: [
      {
        id: 'front',
        name: 'نمای جلو',
        path: TSHIRT_PATH,
        detailPaths: TSHIRT_DETAILS,
        viewBox: "0 0 500 600",
        printArea: { top: 150, left: 145, width: 210, height: 280 } 
      },
      {
        id: 'back',
        name: 'نمای پشت',
        path: TSHIRT_PATH,
        detailPaths: TSHIRT_DETAILS,
        viewBox: "0 0 500 600",
        printArea: { top: 150, left: 145, width: 210, height: 280 }
      }
    ]
  },
  {
    id: 'hoodie-premium',
    name: 'هودی ممتاز',
    type: 'هودی',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'black', name: 'مشکی', hex: '#18181b' },
      { id: 'maroon', name: 'زرشکی', hex: '#450a0a' },
      { id: 'forest', name: 'سبز جنگلی', hex: '#022c22' },
    ],
    views: [
      {
        id: 'front',
        name: 'نمای جلو',
        path: HOODIE_PATH,
        detailPaths: HOODIE_DETAILS,
        viewBox: "0 0 500 600",
        printArea: { top: 190, left: 150, width: 200, height: 220 }
      }
    ]
  }
];

export const FARSI_FONTS = [
  'Vazirmatn',
  'Alibaba',
  'IranSansX',
  'IranYekanX',
  'Kalameh',
  'Morabba',
  'YekanBakh',
];

export const ENGLISH_FONTS = [
  'Montserrat',
  'Roboto',
  'Oswald',
  'Playfair Display',
  'Dancing Script'
];

export const FONTS = [...FARSI_FONTS, ...ENGLISH_FONTS];