export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  passwordChangedAt: Date;
  __v: number;
};
