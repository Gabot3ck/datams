import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = readFileSync(new URL('./MegaMenuPanel.tsx', import.meta.url), 'utf8');

describe('MegaMenuPanel — enlace "ver todo" por subcategoría', () => {
  it('renderiza activeSub.allLink en el pie del panel', () => {
    expect(src).toContain('activeSub.allLink &&');
    expect(src).toContain('href={activeSub.allLink.href}');
  });
});
