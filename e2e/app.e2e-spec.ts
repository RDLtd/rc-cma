import { AngularMPage } from './app.po';

describe('angular-m App', function() {
  let page: AngularMPage;

  beforeEach(() => {
    page = new AngularMPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('rcm works!');
  });
});
