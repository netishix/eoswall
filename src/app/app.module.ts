import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { WallComponent } from './components/wall/wall.component';
import { ModalFormBuyComponent } from './components/modal-form-buy/modal-form-buy.component';
import { ModalFormUpdateComponent } from './components/modal-form-update/modal-form-update.component';
import { ModalNotificationComponent } from './components/modal-notification/modal-notification.component';
import { WhyComponent } from './components/why/why.component';
import { FaqComponent } from './components/faq/faq.component';

import { MouseService } from './services/mouse.service';
import { WindowRef } from "./services/window-ref.service";


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    WallComponent,
    ModalNotificationComponent,
    WhyComponent,
    FaqComponent,
    ModalFormBuyComponent,
    ModalFormUpdateComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
  ],
  providers: [
    WindowRef,
    MouseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
