// https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript

export function convertToCamelCase(value: string): string {
  const convertedValue = value.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });

  return convertedValue;
}

function isArray<T>(value: T): boolean {
  const isValueArray = Array.isArray(value);

  return isValueArray;
};

function isObject<T>(value: T): boolean {
  const isValueObject = value === Object(value) && !isArray(value) && typeof value !== 'function';

  return isValueObject;
}

// TODO: improve types!
export function convertKeysToCamelCase<T>(object: T): T {
  if (isObject(object)) {
    const n = <T>{};

    Object.keys(object).forEach((k) => {
      // @ts-ignore
      n[convertToCamelCase(k)] = convertKeysToCamelCase(object[k]);
    });

    return n;
  } else if (isArray(object)) {
    // @ts-ignore
    return object.map((i) => {
      return convertKeysToCamelCase(i);
    });
  }

  return object;
}
