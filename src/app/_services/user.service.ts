import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { AppConfig } from '../app.config';
import { User } from '../_models';
import { map } from 'rxjs/operators';

@Injectable()

export class UserService {

  constructor(private http: Http, private config: AppConfig) {
  }

  getAll() {
    return this.http.post(this.config.apiUrl + '/users',
      {userCode: this.config.userAPICode, token: this.jwt()}).pipe(map((response: any) => response.json()));
  }

  getById(user_id: string) {
    return this.http.post(this.config.apiUrl + '/users/current',
      {
        user_id: user_id,
        userCode: this.config.userAPICode,
        token: this.jwt()
      }).pipe(map((response: any) => response.json()));
  }

  create(user: User) {
    return this.http.post(this.config.apiUrl + '/users/register',
      {user: user, userCode: this.config.userAPICode, token: this.jwt()}).pipe(map((response: any) => response.json()));
  }

  update(user: User) {
    console.log(user);
    return this.http.post(this.config.apiUrl + '/users/update',
      {user: user, userCode: this.config.userAPICode, token: this.jwt()}).pipe(map((response: any) => response.json()));
  }

  deleteuser(user: User) {
    return this.http.post(this.config.apiUrl + '/users/delete',
      {user: user, userCode: this.config.userAPICode, token: this.jwt()}).pipe(map((response: any) => response.json()));
  }

  backup(message: string) {
    return this.http.post(this.config.apiUrl + '/users/backup',
      {
        message: message,
        userCode: this.config.userAPICode,
        token: this.jwt()
      }).pipe(map((response: any) => response.json()));
  }

  // generate token
  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      const headers = new Headers({
        'Authorization': 'Bearer ' + currentUser.token,
        'apiCategory': 'User'
      });
      return new RequestOptions({headers: headers});
    } else {
      // if there is no user, then we must invent a token
      const headers = new Headers({
        'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge',
        'apiCategory': 'User'
      });
      return new RequestOptions({headers: headers});
    }
  }
}
