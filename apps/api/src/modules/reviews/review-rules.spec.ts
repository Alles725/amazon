import { publicName, summarize } from './review-rules';

const listing = (listingKey: string, ratingCount: number, average: number, distribution: number[] = []) => ({
  listingKey,
  ratingCount,
  ratingSum: Math.round(average * ratingCount),
  distribution,
});

describe('summarize', () => {
  it('is empty (never invented) when there is nothing to aggregate', () => {
    expect(summarize([], [])).toEqual({
      average: null,
      count: 0,
      distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, percent: 0 })),
    });
  });

  it('computes an exact distribution from written reviews only', () => {
    expect(
      summarize(
        [],
        [
          { rating: 5, count: 3 },
          { rating: 2, count: 1 },
        ],
      ),
    ).toEqual({
      average: 4.3,
      count: 4,
      distribution: [
        { stars: 5, percent: 75 },
        { stars: 4, percent: 0 },
        { stars: 3, percent: 0 },
        { stars: 2, percent: 25 },
        { stars: 1, percent: 0 },
      ],
    });
  });

  it('counts a listing shared by variant records once and adds written reviews', () => {
    const family = [
      listing('8bitdo', 5508, 4.8, [92, 5, 1, 0, 2]),
      listing('8bitdo', 5508, 4.8, [92, 5, 1, 0, 2]),
    ];
    const summary = summarize(family, [{ rating: 1, count: 2 }]);
    expect(summary.count).toBe(5510);
    expect(summary.average).toBe(4.8);
    expect(summary.distribution?.map((bucket) => bucket.percent)).toEqual([92, 5, 1, 0, 2]);
  });

  it('hides the distribution when part of the aggregate has none', () => {
    const summary = summarize([listing('a', 100, 4.5), listing('b', 10, 4, [50, 50, 0, 0, 0])], []);
    expect(summary.count).toBe(110);
    expect(summary.distribution).toBeNull();
  });
});

describe('publicName', () => {
  it('shows first name and last initial only', () => {
    expect(publicName('Camila Souza Lima')).toBe('Camila L.');
    expect(publicName('  Rafael  ')).toBe('Rafael');
    expect(publicName('ana maria')).toBe('ana M.');
    expect(publicName('   ')).toBe('Cliente Amazon');
  });
});
