export const isObject = (v: any) => typeof v === 'object' && !(v instanceof Array) && v !== null;