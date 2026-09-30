import {
  ACCENTED,
  PLAIN,
  containsPattern,
  escapeLike,
  normalizeText,
  searchTokens,
} from './catalog-search';

describe('catalog search tokens', () => {
  it('folds case and accents like the SQL translate() it is compared with', () => {
    expect(normalizeText('Fritadeira ELÉTRICA Câmera Ação')).toBe(
      'fritadeira eletrica camera acao',
    );
    expect(ACCENTED).toHaveLength(PLAIN.length);
    // Every accented character maps to exactly what normalizeText produces.
    [...ACCENTED].forEach((char, index) => expect(normalizeText(char)).toBe(PLAIN[index]));
  });

  it('splits on punctuation, drops duplicates and one-letter words next to real ones', () => {
    expect(searchTokens('  Fone   e fone-Bluetooth! ')).toEqual(['fone', 'bluetooth']);
    expect(searchTokens('x')).toEqual(['x']);
    expect(searchTokens('')).toEqual([]);
    expect(searchTokens(undefined)).toEqual([]);
  });

  it('stems a trailing plural "s" on longer words only', () => {
    expect(searchTokens('Fones tênis gás')).toEqual(['fone', 'teni', 'gas']);
  });

  it('caps the number of words and the query length', () => {
    expect(searchTokens('a1 b2 c3 d4 e5 f6 g7 h8 i9 j10')).toHaveLength(8);
    expect(searchTokens(`${'a'.repeat(150)}`)[0]).toHaveLength(100);
  });

  it('escapes LIKE wildcards so they match literally', () => {
    expect(escapeLike('50%_off\\')).toBe('50\\%\\_off\\\\');
    expect(containsPattern('100%')).toBe('%100\\%%');
  });
});
