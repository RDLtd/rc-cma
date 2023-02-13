import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AppConfig } from './app.config';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {

  constructor(
      private readonly title: Title,
      private config: AppConfig
  ) {
    super();
  }
  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);

    if (title === undefined) {
      this.title.setTitle(`${this.config.brand.name}`);
      return;
    }

    this.title.setTitle(`${this.config.brand.name} | ${title}`);
  }
}
