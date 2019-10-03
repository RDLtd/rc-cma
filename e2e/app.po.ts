import { browser, element, by } from 'protractor';

export class AngularMPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('rcm-root h1')).getText();
  }
}
