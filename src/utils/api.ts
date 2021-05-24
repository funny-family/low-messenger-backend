import { nanoid } from 'nanoid';

import { checkIfObjectEmpty } from './check-if-object-empty.function';

interface ResponseObjectData {
  readonly id: string;
  title: string;
  attributes: any;
}

interface ResponseObjectErrors {
  readonly id: string;
  title: string;
  status: number;
}

export interface ResponseObjectType {
  success?: boolean;
  data: ResponseObjectData | any;
  errors: ResponseObjectErrors | any;
}

export class ResponseObject {
  constructor(responseObject: ResponseObjectType) {
    const isDataObjectEmpty = checkIfObjectEmpty(responseObject.data);
    const isErrorsObjetEmpty = checkIfObjectEmpty(responseObject.errors);

    responseObject.success = true;

    if (isDataObjectEmpty) {
      responseObject.errors.id = nanoid(30);
    }

    if (isErrorsObjetEmpty) {
      responseObject.data.id = nanoid(30);
    }

    if (!isErrorsObjetEmpty) {
      responseObject.success = false;
    }

    return responseObject;
  }
}
