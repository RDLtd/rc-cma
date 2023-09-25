import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
  AnalyticsService,
  ErrorService
} from './_services';

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
  CmsLocalService,
  CmsMenuDishComponent,
  CmsReservationsComponent,
  CmsDashboardComponent,
  CmsSpwConfigComponent,
  CmsSpwLinksComponent,
  CmsSpwBuilderComponent,
  RestaurantDetailComponent,
  CmsEventsComponent
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
  TranslateLoader,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { MarkdownModule } from 'ngx-markdown';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { JoinComponent } from './join/join.component';
import { LoadComponent } from './common/loader/load.component';
import { QRCodeModule } from 'angularx-qrcode';
import { GoogleMapsModule } from '@angular/google-maps';
import { MembershipComponent } from './join/membership.component';
import { LogoComponent } from './common/logo/logo.component';
import { CurrencyPipe } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { CloudinaryModule } from '@cloudinary/ng';
import { OnlineStatusModule } from 'ngx-online-status';
import { AppTitleStrategy } from './app-title-strategy';
import { ContactComponent } from "./common/contact/contact.component";
import { FaqsComponent } from "./common/faqs/faqs.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InitModule } from './init/init.module';
import { EventFormComponent } from './cms/events/event-form.component';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
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
    CmsSpwBuilderComponent,
    CmsEventsComponent,
    EventFormComponent
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
        InitModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
  providers: [
    //AppConfig,
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
    ConfirmCancelComponent,
    LoadService,
    CurrencyPipe,
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy
    },
    ErrorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
