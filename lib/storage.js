export const setItem = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getItem = (key, fallback = null) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  }
  return fallback;
};

export const removeItem = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const clearAll = () => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
};
