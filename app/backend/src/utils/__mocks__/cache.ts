export const getOrSetCache = (_key: string, fetcher: any) => fetcher();
export const invalidateCache = () => Promise.resolve();
export const getCache = () => Promise.resolve(null);
export const setCache = () => Promise.resolve();
