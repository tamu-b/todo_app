export type SuccessResult<T> = {
  type: 'success';
  data: T;
};

export type BadRequestResult = {
  type: 'bad-request';
};

export type ValidationErrorResult<T extends string> = {
  type: 'validation-error';
  message: Partial<Record<T, string[]>>;
};

export type NotFoundResult = {
  type: 'not-found';
};

export type UnexpectedErrorResult = {
  type: 'error';
};
