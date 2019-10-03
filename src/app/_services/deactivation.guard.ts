import { CanDeactivate } from '@angular/router';



export interface CanComponentDeactivate {
  canDeactivate: () => any; // boolean|Promise<boolean>|Observable<boolean>;
}

export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {



  canDeactivate(target: any) {
    return target.confirmNavigation();
  }

}
