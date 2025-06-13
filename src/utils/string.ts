import { createHash } from 'crypto';

export const hashify = (input: string) => {
  return createHash('sha256').update(input).digest('hex');
}

export const generateRandomAlphaNumericalString = (n: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  let result = '';
  
  for (let i = 0; i < n; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}