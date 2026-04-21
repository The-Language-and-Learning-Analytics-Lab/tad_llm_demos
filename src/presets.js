/**
 * Preset analogies. Variable convention matches the displayed formula A − B + C = ?
 *
 *   a  — the "relationship" term (what you subtract from)
 *   b  — the "source"       term (what you subtract)
 *   c  — the test input
 *   ?  — expected output
 *
 * So the formula reads: a − b + c ≈ expected
 * Example: france − paris + tokyo ≈ japan
 *          "france is to paris as ? is to tokyo" → japan
 */
export const PRESET_ANALOGIES = [
  // Capitals — most reliable
  { category: 'Capitals',     a: 'france',     b: 'paris',       c: 'tokyo',      expected: 'japan' },
  { category: 'Capitals',     a: 'germany',    b: 'berlin',      c: 'rome',       expected: 'italy' },
  { category: 'Capitals',     a: 'egypt',      b: 'cairo',       c: 'nairobi',    expected: 'kenya' },
  { category: 'Capitals',     a: 'canada',     b: 'ottawa',      c: 'canberra',   expected: 'australia' },

  // Currency & language — also strong
  { category: 'Currency',     a: 'yen',        b: 'japan',       c: 'mexico',     expected: 'peso' },
  { category: 'Currency',     a: 'dollar',     b: 'usa',         c: 'india',      expected: 'rupee' },
  { category: 'Language',     a: 'french',     b: 'france',      c: 'germany',    expected: 'german' },
  { category: 'Language',     a: 'portuguese', b: 'brazil',      c: 'argentina',  expected: 'spanish' },

  // Famous figures → domain
  { category: 'People',       a: 'physics',    b: 'einstein',    c: 'darwin',     expected: 'biology' },
  { category: 'People',       a: 'music',      b: 'mozart',      c: 'picasso',    expected: 'painting' },
  { category: 'People',       a: 'plays',      b: 'shakespeare', c: 'tolkien',    expected: 'novels' },

  // Animal → young
  { category: 'Animals',      a: 'puppy',      b: 'dog',         c: 'cat',        expected: 'kitten' },
  { category: 'Animals',      a: 'calf',       b: 'cow',         c: 'horse',      expected: 'foal' },

  // Comparative adjectives
  { category: 'Comparatives', a: 'better',     b: 'good',        c: 'bad',        expected: 'worse' },
  { category: 'Comparatives', a: 'smaller',    b: 'small',       c: 'large',      expected: 'larger' },

  // Gender
  { category: 'Gender',       a: 'queen',      b: 'king',        c: 'man',        expected: 'woman' },
  { category: 'Gender',       a: 'mother',     b: 'father',      c: 'brother',    expected: 'sister' },

  // Profession → workplace
  { category: 'Professions',  a: 'kitchen',    b: 'chef',        c: 'pilot',      expected: 'cockpit' },
  { category: 'Professions',  a: 'classroom',  b: 'teacher',     c: 'doctor',     expected: 'hospital' },

  // Part → whole
  { category: 'Parts',        a: 'car',        b: 'wheel',       c: 'wing',       expected: 'airplane' },
  { category: 'Parts',        a: 'flower',     b: 'petal',       c: 'leaf',       expected: 'tree' },
];

export const PRESET_CATEGORIES = [...new Set(PRESET_ANALOGIES.map(p => p.category))];

export const PRESETS_BY_CATEGORY = PRESET_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = PRESET_ANALOGIES.filter(p => p.category === cat);
  return acc;
}, {});
