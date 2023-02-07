import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()

export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthenticationService) {}

  canActivate(): boolean {
    if (!this.auth.isAuth()) {
      this.router.navigate(['/']).then();
      return false;
    }
    return true;
  }

}
