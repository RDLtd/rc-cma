import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HttpClientModule,
  HttpClient
} from '@angular/common/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { AppConfig } from './app.config';
import { SafePipe } from './app.safe';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { SigninComponent } from './signin.component';
import { AboutComponent } from './about.component';
import { PwdMatchValidator } from './pwdMatch.validator';
import { AngularMaterialModule } from './angular-material.module';

import {
  AuthGuard,
  AuthenticationService,
  CanDeactivateGuard,
  UserService,
  MemberService,
  RestaurantService,
  FinancialService,
  CMSService,
  PublicService,
  HelpService,
  AnalyticsService
} from './_services';

import {
  RestaurantDetailComponent,
  BenchmarkComponent,
  BenchmarkWizardComponent,
} from './restaurants';

import {
  RestaurantLookupComponent,
  ProfilePageComponent,
  ProfileVerifyComponent,
  PasswordComponent,
  ProfileDetailComponent,
  ProfileImageComponent
} from './users';

import {
  CmsImagesComponent,
  CmsComponent,
  CmsDirectoryComponent,
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
  AffiliatesComponent
} from './cms';

import {
  FsComponent,
  ProfitComponent,
  BalanceComponent,
  StaffComponent,
  PropertyComponent,
  TurnoverComponent,
  FsGraphComponent,
  FsInputComponent,
  ReviewComponent
} from './fs';

import {
  LoaderComponent,
  PaymentComponent,
  HelpComponent,
  ConfirmCancelComponent,
  MessageComponent,
  GoogleChartComponent
} from './common';

// 3rd party packages
import { AgmCoreModule } from '@agm/core';
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { MarkdownModule } from 'ngx-markdown';
import { ClipboardModule } from 'ngx-clipboard';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    PasswordComponent,
    GoogleChartComponent,
    BenchmarkComponent,
    ReviewComponent,
    BenchmarkWizardComponent,
    RestaurantLookupComponent,
    RestaurantDetailComponent,
    ProfilePageComponent,
    ProfileVerifyComponent,
    ConfirmCancelComponent,
    MessageComponent,
    PwdMatchValidator,
    ProfileDetailComponent,
    ProfileImageComponent,
    CmsImagesComponent,
    CmsComponent,
    CmsDirectoryComponent,
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
    FsComponent,
    ProfitComponent,
    BalanceComponent,
    StaffComponent,
    PropertyComponent,
    TurnoverComponent,
    FsGraphComponent,
    FsInputComponent,
    LoaderComponent,
    HelpComponent,
    PaymentComponent,
    SafePipe,
    SigninComponent,
    AffiliatesComponent
  ],
  imports: [
    AngularMaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
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
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCji4lOA-nPgICQjFO_4rVyuWKW1jP1Lkc'
    }),
    MarkdownModule.forRoot()
  ],
  providers: [
    AppConfig,
    AuthenticationService,
    UserService,
    MemberService,
    RestaurantService,
    AuthGuard,
    CanDeactivateGuard,
    FinancialService,
    CMSService,
    CmsLocalService,
    HelpService,
    AnalyticsService,
    PublicService,
    CmsPreviewComponent,
    ConfirmCancelComponent
  ],
  entryComponents: [
    BenchmarkComponent,
    ReviewComponent,
    BenchmarkWizardComponent,
    RestaurantLookupComponent,
    RestaurantDetailComponent,
    ConfirmCancelComponent,
    MessageComponent,
    PasswordComponent,
    ProfileDetailComponent,
    ProfileImageComponent,
    ProfileVerifyComponent,
    CmsImageDialogComponent,
    CmsFileUploadComponent,
    CmsMenuDishComponent,
    AboutComponent,
    HelpComponent,
    PaymentComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
