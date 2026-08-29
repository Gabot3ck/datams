import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import DocsChecklist from './DocsChecklist.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(DocsChecklist, { props });

describe('DocsChecklist', () => {
  it('lista cada documento', async () => {
    const html = await render({ heading: 'Documentos', items: ['Identificación oficial', 'W-2 de cada trabajo'] });
    expect(html).toContain('Identificación oficial');
    expect(html).toContain('W-2 de cada trabajo');
    expect(html).toMatch(/role="list"|<ul/);
  });
  it('muestra la nota si se pasa', async () => {
    const html = await render({ heading: 'X', items: ['a'], note: 'Si te falta algo, dínoslo antes.' });
    expect(html).toContain('Si te falta algo, dínoslo antes.');
  });
  it('omite la nota si no se pasa', async () => {
    const html = await render({ heading: 'X', items: ['a'] });
    expect(html).not.toContain('undefined');
  });
});
