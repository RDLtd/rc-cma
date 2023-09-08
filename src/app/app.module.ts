
import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterModule, TitleStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HttpClientModule,
  HttpClient
} from '@angular/common/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { AppConfig } from './app.config';
import { SafePipe } from './shared/app.safe';
import { HeaderComponent } from './common/header.component';
import { SigninComponent } from './signin/signin.component';
import { AboutComponent } from './common/about.component';
import { PwdMatchValidator } from './shared/pwdMatch.validator';
import { AngularMaterialModule } from './shared/angular-material.module';

import {
  AuthGuard,
  AuthenticationService,
  CanDeactivateGuard,
  UserService,
  MemberService,
  RestaurantService,
  CMSService,
  PublicService,
  AnalyticsService,
  ErrorService
} from './_services';

import {
  RestaurantDetailComponent,
} from './cms/restaurant-detail.component';

import {
  RestaurantLookupComponent,
  SettingsComponent,
  VerificationComponent,
  PasswordComponent,
  ContactsComponent,
  ImageComponent
} from './settings';

import {
  CmsImagesComponent,
  CmsComponent,
  CmsMenusComponent,
  CmsHoursComponent,
  CmsFeaturesComponent,
  CmsLocationComponent,
  CmsImageDialogComponent,
  CmsFileUploadComponent,
  CmsPreviewComponent,
  CmsLocalService,
  CmsMenuDishComponent,
  CmsReservationsComponent,
  CmsDashboardComponent,
} from './cms';

import {
  LoaderComponent,
  HelpComponent,
  ConfirmCancelComponent,
  MessageComponent,
  HelpService,
  LoadService
} from './common';

// 3rd party packages
import {
  TranslateModule,
  TranslateLoader, TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { MarkdownModule } from 'ngx-markdown';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { JoinComponent } from './join/join.component';
import { LoadComponent } from './common/loader/load.component';
import { CmsSpwLinksComponent } from './cms/cms-spw-links.component';
import { QRCodeModule } from 'angularx-qrcode';
import { GoogleMapsModule } from '@angular/google-maps';
import { MembershipComponent } from './join/membership.component';
import { LogoComponent } from './common/logo/logo.component';
import { CurrencyPipe } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import {CloudinaryModule} from '@cloudinary/ng';
import { OnlineStatusModule } from 'ngx-online-status';
import { AppTitleStrategy } from './app-title-strategy';
import { lastValueFrom } from 'rxjs';
import {ContactComponent} from "./common/contact/contact.component";
import {FaqsComponent} from "./common/faqs/faqs.component";
import {MatExpansionModule} from "@angular/material/expansion";
import { CmsSpwConfigComponent } from './cms/cms-spw-config.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CmsSpwBuilderComponent } from './cms/cms-spw-builder.component';
import { InitModule } from './init/init.module';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

// Make App initialisation dependent on translations
// so that we can rely on 'instant' access everywhere else
export function appInitializerFactory(translate: TranslateService) {
  // LocalStorage is read/set in index.html
  const languages = ['en', 'fr'];
  let lang = localStorage.getItem('rd_language');
  return () => {
    // console.log(`Translation loaded (${lang})`, languages.includes(lang));
    translate.addLangs(languages);
    // If the user language is not supported, default to en
    if (!languages.includes(lang)) { lang = 'en'; }
    translate.setDefaultLang(lang);
    return lastValueFrom(translate.use(lang));
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PasswordComponent,
    RestaurantLookupComponent,
    RestaurantDetailComponent,
    SettingsComponent,
    VerificationComponent,
    ConfirmCancelComponent,
    MessageComponent,
    PwdMatchValidator,
    ContactsComponent,
    ImageComponent,
    CmsImagesComponent,
    CmsComponent,
    CmsMenusComponent,
    CmsHoursComponent,
    CmsFeaturesComponent,
    CmsLocationComponent,
    CmsPreviewComponent,
    CmsImageDialogComponent,
    CmsFileUploadComponent,
    CmsMenuDishComponent,
    CmsReservationsComponent,
    CmsDashboardComponent,
    AboutComponent,
    LoaderComponent,
    HelpComponent,
    ContactComponent,
    FaqsComponent,
    SafePipe,
    SigninComponent,
    JoinComponent,
    LoadComponent,
    CmsSpwLinksComponent,
    MembershipComponent,
    LogoComponent,
    ProfileComponent,
    CmsSpwConfigComponent,
    CmsSpwBuilderComponent
  ],
    imports: [
        AngularMaterialModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        FileUploadModule,
        ClipboardModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        MarkdownModule.forRoot(),
        CloudinaryModule,
        QRCodeModule,
        GoogleMapsModule,
        ClipboardModule,
        OnlineStatusModule,
        MatExpansionModule,
        MatSlideToggleModule,
        InitModule
    ],
  providers: [
    AppConfig,
    AuthenticationService,
    UserService,
    MemberService,
    RestaurantService,
    AuthGuard,
    CanDeactivateGuard,
    CMSService,
    CmsLocalService,
    HelpService,
    AnalyticsService,
    PublicService,
    CmsPreviewComponent,
    ConfirmCancelComponent,
    LoadService,
    CurrencyPipe,
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true
    },
    ErrorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
