import { describe, it, expect } from 'vitest';
import inventory from '../src/data/tool-inventory.json';
import type { ToolInventory } from '../src/data/tool-inventory.schema';
import { search } from '../src/scripts/directory-search';

const data = inventory as ToolInventory;

describe('directory-search', () => {
  it('"shrink" finds compression tools', () => {
    const results = search(data, 'shrink');
    const ids = results.map(r => r.id);
    expect(ids).toContain('compress-image');
    expect(ids).toContain('compress-pdf');
  });

  it('"qr" finds the QR generator', () => {
    const results = search(data, 'qr');
    expect(results.map(r => r.id)).toContain('qr-code-generator');
  });

  it('"heic" finds the HEIC converter', () => {
    const results = search(data, 'heic');
    expect(results.map(r => r.id)).toContain('convert-heic-raw-psd');
  });

  it('empty query returns all directory entries', () => {
    const results = search(data, '');
    const expected = data.filter(t => t.appears_on_directory).length;
    expect(results.length).toBe(expected);
  });

  it('whitespace-only query returns all directory entries', () => {
    const results = search(data, '   ');
    const expected = data.filter(t => t.appears_on_directory).length;
    expect(results.length).toBe(expected);
  });

  it('does not return entries marked appears_on_directory=false', () => {
    // currently every entry is appears_on_directory=true, but the test future-proofs
    const visible = data.filter(t => t.appears_on_directory);
    const results = search(data, '');
    expect(results.every(r => visible.includes(r))).toBe(true);
  });
});
