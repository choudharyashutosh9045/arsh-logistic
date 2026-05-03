// Convert a number to Indian Rupees in words
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigit = (n: number): string => {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? ' ' + ones[o] : '');
};

const threeDigit = (n: number): string => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = '';
  if (h) s += ones[h] + ' Hundred';
  if (r) s += (h ? ' ' : '') + twoDigit(r);
  return s;
};

export const numberToWords = (num: number): string => {
  if (!num || num === 0) return 'Zero';

  const isNegative = num < 0;
  num = Math.abs(Math.floor(num));

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  let result = '';
  if (crore) result += threeDigit(crore) + ' Crore ';
  if (lakh) result += twoDigit(lakh) + ' Lakh ';
  if (thousand) result += twoDigit(thousand) + ' Thousand ';
  if (remainder) result += threeDigit(remainder);

  return (isNegative ? 'Minus ' : '') + result.trim() + ' Only';
};
