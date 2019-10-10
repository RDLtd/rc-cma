import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { User } from '../_models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()

export class UserService {

  constructor(private http: HttpClient, private config: AppConfig) {
  }

  getAll() {
    return this.http.post(this.config.apiUrl + '/users',
      {userCode: this.config.userAPICode, token: this.jwt()});
  }

  getById(user_id: string) {
    return this.http.post(this.config.apiUrl + '/users/current',
      {
        user_id: user_id,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  create(user: User) {
    return this.http.post(this.config.apiUrl + '/users/register',
      {user: user, userCode: this.config.userAPICode, token: this.jwt()});
  }

  update(user: User) {
    console.log(user);
    return this.http.post(this.config.apiUrl + '/users/update',
      {user: user, userCode: this.config.userAPICode, token: this.jwt()});
  }

  deleteuser(user: User) {
    return this.http.post(this.config.apiUrl + '/users/delete',
      {user: user, userCode: this.config.userAPICode, token: this.jwt()});
  }

  backup(message: string) {
    return this.http.post(this.config.apiUrl + '/users/backup',
      {
        message: message,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  // Generate Token
  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const requestOptions = {
      params: new HttpParams()
    };
    requestOptions.params.set('foo', 'bar');
    requestOptions.params.set('apiCategory', 'Financial');

    if (currentUser && currentUser.token) {
      requestOptions.params.set('Authorization', 'Bearer ' + currentUser.token);
    } else {
      requestOptions.params.set('Authorization', 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge');
    }
    return requestOptions;
  }
}
