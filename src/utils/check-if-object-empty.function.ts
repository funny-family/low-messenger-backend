export function checkIfObjectEmpty(object: object): boolean {
  const isObjectEmpty = Object.keys(object).length === 0 && object.constructor === Object;

  return isObjectEmpty;
}
