import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { User } from '../_models';
import { HttpClient } from '@angular/common/http';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  authToken;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private config: AppConfig) {
    this.appService.authToken.subscribe(token => this.authToken = token);
  }

  getAll() {
    return this.http.post(this.config.apiUrl + '/users',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getById(user_id: string) {
    return this.http.post(this.config.apiUrl + '/users/current',
      {
        user_id: user_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  create(user: User) {
    return this.http.post(this.config.apiUrl + '/users/register',
      {
        user: user,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  update(user: User) {
    console.log(user);
    return this.http.post(this.config.apiUrl + '/users/update',
      {
        user: user,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteuser(user: User) {
    return this.http.post(this.config.apiUrl + '/users/delete',
      {
        user: user,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  backup(message: string) {
    return this.http.post(this.config.apiUrl + '/users/backup',
      {
        message: message,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
}
