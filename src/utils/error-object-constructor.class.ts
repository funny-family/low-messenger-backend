interface ErrorObjectOptions {
  field: string;
  message: string;
  name?: string;
}

export class ErrorObjectConstructor {
  constructor(errorObject: ErrorObjectOptions) {
    errorObject.name = 'Error';

    return {
      errors: {
        [errorObject.field]: {
          name: errorObject.name,
          message: errorObject.message,
          path: errorObject.field
        }
      }
    };
  }
}
