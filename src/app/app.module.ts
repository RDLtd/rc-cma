import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { AppConfig } from './app.config';
import { SafePipe } from './app.safe';

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
  RestaurantLookupComponent,
  RestaurantDetailComponent,
  FinancialDetailComponent,
  FinancialViewComponent,
  BenchmarkComponent,
  BenchmarkWizardComponent,
  ReviewComponent,
  MapDetailComponent,
  RestaurantListComponent
} from './restaurants';

import {
  MemberListComponent,
  ProfilePageComponent,
  ProfileVerifyComponent,
  PasswordComponent,
  ProfileDetailComponent,
  ProfileImageComponent,
  MemberDetailComponent
} from './members';

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
  CmsDashboardComponent
} from './cms';

import {
  FsComponent,
  ProfitComponent,
  BalanceComponent,
  StaffComponent,
  PropertyComponent,
  TurnoverComponent,
  FsGraphComponent,
  FsInputComponent
} from './fs';

import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

import { LoaderComponent } from './loader/loader.component';
import { PaymentComponent } from './payment/payment.component';
import { HelpComponent } from './help/help.component';

import { AboutComponent } from './about.component';
import { ConfirmCancelComponent } from './confirm-cancel/confirm-cancel.component';
import { MessageComponent } from './messages/message.component';
import { PwdMatchValidator } from './pwdMatch.validator';
import { GoogleChartComponent } from './google-chart/google-chart.component';

// packages
//import { ImageUploadModule } from 'angular2-image-upload';

import { AgmCoreModule } from '@agm/core';
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { MarkdownModule } from 'ngx-markdown';
import { ClipboardModule } from 'ngx-clipboard';
import { AngularMaterialModule } from './angular-material.module';
import { SigninComponent } from './signin.component';
import { AffiliatesComponent } from './affiliates/affiliates.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

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
    MemberListComponent,
    GoogleChartComponent,
    MemberDetailComponent,
    MapDetailComponent,
    FinancialDetailComponent,
    FinancialViewComponent,
    BenchmarkComponent,
    ReviewComponent,
    BenchmarkWizardComponent,
    RestaurantLookupComponent,
    RestaurantDetailComponent,
    RestaurantListComponent,
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
    //ImageUploadModule.forRoot(),
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
    MapDetailComponent,
    FinancialDetailComponent,
    FinancialViewComponent,
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
