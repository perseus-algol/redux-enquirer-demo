export type VisitorFn<T> = (o: T, path: Array<string | number>, value: unknown) => void;

const traverseInternal = <T>(
  sourceObj: T,
  visitorFn: VisitorFn<T>,
  value: unknown,
  path: Array<string | number>,
): void => {
  visitorFn(sourceObj, path, value);
  if (value instanceof Array) {
    value.forEach((v, idx) => traverseInternal(sourceObj, visitorFn, v, [...path, idx]))
  } else if (value !== null && typeof value === 'object') {
    Object.entries(value)
      .forEach(([k, v]) => traverseInternal(sourceObj, visitorFn, v, [...path, k]));
  }
};

export const traverse = <T>(sourceObj: T, fn: VisitorFn<T>) => traverseInternal(sourceObj, fn, sourceObj, []);