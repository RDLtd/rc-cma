// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

import 'zone.js/dist/zone-error';

export const environment = {
  production: false,
  // Local
  API_URL: 'http://localhost:4000',
  // Review
  // API_URL: 'https://rc-server-hubbard-zag5yegk8gkh.herokuapp.com',
  // Staging
  // API_URL: 'https://rc-server-staging.herokuapp.com',

  // RC Keys
  stripe_key: 'pk_test_51HwTj0DK2S86a4QiDZ7hvjuiwLjWSZU3Yy5LFYnBrEDHNsCF1nbwrXOzCOPPDV0cxHvZIC5m5TZsbWoAztS4ZCnE00nKRGn4jh',
  // stripe_key: 'pk_live_51HwTj0DK2S86a4Qia8CGKD9o1mmQ474tUk3v3vJXyiIXNRdZF2eFPQYmTas5khh2Y5oIGgCTG4D4gyJJ2FB3HHIK00mTDK1LbI'

  // RI keys
  // stripe_key:
  // 'pk_test_51IiLuvFvEMJjooglWWYi5x9e8qhgAKicxWM99ZMObs6VjHcg8sIsG02bwQ0kqS11P415ykLiLryuGGkQVYt4ELYd009D10tr8L'
};
