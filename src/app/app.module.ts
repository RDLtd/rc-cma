
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
import { SafePipe } from './shared/app.safe';
import { HeaderComponent } from './common/header.component';
import { FooterComponent } from './common/footer.component';
import { SigninComponent } from './signin/signin.component';
import { AboutComponent } from './common/about.component';
import { PwdMatchValidator } from './shared/pwdMatch.validator';
import { AngularMaterialModule } from './shared/angular-material.module';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import * as  Cloudinary from 'cloudinary-core';

import {
  AuthGuard,
  AuthenticationService,
  CanDeactivateGuard,
  UserService,
  MemberService,
  RestaurantService,
  CMSService,
  PublicService,
  HelpService,
  AnalyticsService
} from './_services';

import {
  RestaurantDetailComponent,
} from './restaurants/restaurant-detail.component';

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
  LoaderComponent,
  HelpComponent,
  ConfirmCancelComponent,
  MessageComponent
} from './common';

// 3rd party packages
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { MarkdownModule } from 'ngx-markdown';
import { ClipboardModule } from 'ngx-clipboard';
import { JoinComponent } from './join/join.component';
import { ReferralsComponent } from './users/referrals.component';
import { LoadComponent } from './common/loader/load.component';
import { LoadService } from './common/loader/load.service';
import { CmsSpwLinksComponent } from './cms/cms-spw-links.component';
import { QRCodeModule } from 'angularx-qrcode';
import { GoogleMapsModule } from '@angular/google-maps';
import { StripeComponent } from './common/payment/stripe.component';


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
    LoaderComponent,
    HelpComponent,
    SafePipe,
    SigninComponent,
    AffiliatesComponent,
    JoinComponent,
    ReferralsComponent,
    LoadComponent,
    CmsSpwLinksComponent,
    StripeComponent
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
    MarkdownModule.forRoot(),
    CloudinaryModule.forRoot(Cloudinary, {
      cloud_name: 'rdl',
      api_key: '713165672947878',
      api_secret: 'EhLM0NhD7HvJDjX5IvF90u6guq8'
    }),
    QRCodeModule,
    GoogleMapsModule
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
    LoadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
