/**
 * RenToan v1.4.0 - Bộ sinh số ngẫu nhiên có seed.
 * Hoạt động trên trình duyệt và Node.js, không cần thư viện ngoài.
 */

function hashSeed(seed) {
  const text = String(seed ?? 'rentoan');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mulberry32: PRNG nhỏ, nhanh và có thể tái tạo. */
export function createSeededRandom(seed = Date.now()) {
  let state = hashSeed(seed);
  const rng = () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  rng.seed = String(seed);
  return rng;
}

export function randomInt(min, max, rng = Math.random) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError('randomInt yêu cầu min, max là số nguyên và min <= max.');
  }
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick(items, rng = Math.random) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('pick yêu cầu một mảng không rỗng.');
  }
  return items[randomInt(0, items.length - 1, rng)];
}

export function shuffle(items, rng = Math.random) {
  if (!Array.isArray(items)) throw new TypeError('shuffle yêu cầu một mảng.');
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i, rng);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createSeed(prefix = 'RT') {
  const time = Date.now().toString(36).toUpperCase();
  const entropy = Math.floor(Math.random() * 0xFFFFFF).toString(36).toUpperCase().padStart(5, '0');
  return `${prefix}-${time}-${entropy}`;
}
