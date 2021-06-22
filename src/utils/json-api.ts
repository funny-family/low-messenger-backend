type JsonApiData = {
  type: string;
  id: string;
  attributes: string;
  relationships?: string;
};

type JsonApiErrorsLinks = {
  self: string;
  related?: {
    href: string;
    meta: {
      count: number;
    };
  };
};

/**
 * @see https://jsonapi.org/format/#errors
 */
type JsonApiErrors = {
  id: string;
  links: JsonApiErrorsLinks;
  status: number;
  code?: string;
  title?: string;
  detail?: string;
  source?: any;
};

/**
 * @see https://jsonapi.org/format/#document-meta
 */
type JsonApiMeta = {
  copyright: string; // Copyright 2021 Example Corp.
  authors?: string[];
};

export type JsonApiObject = {
  data: JsonApiData | {};
  errors: JsonApiErrors | {};
  meta: JsonApiMeta | {};
};

export class JsonApiGenerator {
  constructor(jsonApiObject: JsonApiObject) {
    return jsonApiObject;
  }
}
