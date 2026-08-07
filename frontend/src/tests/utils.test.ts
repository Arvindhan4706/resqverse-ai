import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('utils', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('bg-red-500', undefined, 'text-white')).toBe('bg-red-500 text-white');
  });
});
