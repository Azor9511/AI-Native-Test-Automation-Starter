export interface Credentials {
  username: string;
  password: string;
}

// Public demo credentials, published on the SauceDemo login page.
export const standardUser: Credentials = {
  username: 'standard_user',
  password: 'secret_sauce',
};
