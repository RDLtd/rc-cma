// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

import 'zone.js/dist/zone-error';

export const environment = {
  production: false,
  API_URL: 'http://localhost:4000',
  stripe_key: 'pk_test_51HwTj0DK2S86a4QiDZ7hvjuiwLjWSZU3Yy5LFYnBrEDHNsCF1nbwrXOzCOPPDV0cxHvZIC5m5TZsbWoAztS4ZCnE00nKRGn4jh'
};
