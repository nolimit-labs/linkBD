export interface TestUser {
  email: string;
  password: string;
  displayName?: string;
}

export const testUsers = {
  freeAccountNoOrg: {
    email: 'test+free_account_no_org@linkbd.io',
    password: 'Password1',
  },
  freeAccountWithOrg: {
    email: 'test+free_account_with_org@linkbd.io',
    password: 'Password1',
  },
  
}; 