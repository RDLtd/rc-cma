import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {ConfigService} from "./init/config.service";

@Injectable()
export class AppTitleStrategy extends TitleStrategy {

  private brand;

  constructor(
      private readonly title: Title,
      private config: ConfigService
  ) {
    super();
    console.log('Assign brand');
    this.config.brand.subscribe(obj => this.brand = obj);
  }
  override updateTitle(routerState: RouterStateSnapshot) {

    const title = this.buildTitle(routerState);

    if (title === undefined) {
      this.title.setTitle('RDL');
      return;
    }

    this.title.setTitle(`${this.brand.name ?? 'RDL'} | ${title}`);
  }

}
