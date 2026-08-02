export const validationMessages = {
  isString: (property: string) => `${property}は文字列で入力してください`,
  minLength: (property: string, min: number) =>
    `${property}は${min}文字以上で入力してください`,
  maxLength: (property: string, max: number) =>
    `${property}は${max}文字以内で入力してください`,
  isDate: (property: string) => `${property}は有効な日付を入力してください`,
};
