import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';



export interface CanComponentDeactivate {
  canDeactivate: () => any; // boolean|Promise<boolean>|Observable<boolean>;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {



  canDeactivate(target: any) {
    return target.confirmNavigation();
  }

}
