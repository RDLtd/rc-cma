
// src/app/airbrake-error-handler.ts

import { ErrorHandler } from '@angular/core';
import { Notifier } from '@airbrake/browser';

export class AirbrakeErrorHandler implements ErrorHandler {
  airbrake: Notifier;

  constructor() {
    this.airbrake = new Notifier({
      projectId: 480741,
      projectKey: '1fdebb905739780366a931460fb6958c',
      environment: 'production'
    });
  }

  handleError(error: any): void {
  }
}
