// /utils/cache.js
const cache = new Map();
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

const set = (key, value) => {
    const record = {
        value: value,
        expiry: Date.now() + CACHE_DURATION_MS,
    };
    cache.set(key, record);
};

const get = (key) => {
    const record = cache.get(key);
    if (!record) {
        return null; // Not in cache
    }

    if (Date.now() > record.expiry) {
        cache.delete(key);
        return null; // Expired
    }

    return record.value;
};

const clear = () => {
    cache.clear();
};

module.exports = {
    get,
    set,
    clear
};
