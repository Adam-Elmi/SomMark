import { describe, it, expect } from 'vitest';
import SomMark from '../../index.js';

/**
 * Shared Mappers Test Suite (Universal Tags)
 */
describe('Shared Mappers (raw)', () => {

    describe('raw', () => {
        it('should render raw content without parsing', async () => {
            const sm = new SomMark({
                src: '@_raw_@;<b>[p]No Parse[end]</b>@_end_@',
                format: 'html'
            });
            const output = await sm.transpile();
            expect(output).toBe('<b>[p]No Parse[end]</b>');
        });
    });
});
