export function checkIfStringIsEmpty(string: string): boolean {
  if (string === '' || string === undefined || string.trim() === '' || string.length <= 0) {
    return true;
  }

  return false;
}
