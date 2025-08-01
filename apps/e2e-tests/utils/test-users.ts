export interface TestUser {
  email: string;
  password: string;
  displayName?: string;
}

export const testUsers = {
  user1: {
    email: 'nolimitlabsdev+test_main@gmail.com',
    password: 'Password1',
  },
  
  // the clerk_test has preset verification code, code is 424242
  user2: {
    email: 'user2+clerk_test@example.com', 
    password: 'Password1',
  },

  freePlanUser: {
    email: 'free-plan-user+clerk_test@example.com',
    password: 'Password1',
  },
  
}; 