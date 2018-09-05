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
import { ModalSlotFormComponent } from './components/modal-slot-form/modal-slot-form.component';
import { ModalNotificationComponent } from './components/modal-notification/modal-notification.component';
import { WhyComponent } from './components/why/why.component';

import { AuthService } from './services/auth.service';
import { MouseService } from './services/mouse.service';
import { FaqComponent } from './components/faq/faq.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    WallComponent,
    ModalSlotFormComponent,
    ModalNotificationComponent,
    WhyComponent,
    FaqComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule.forRoot(),
  ],
  providers: [
    AuthService,
    MouseService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalSlotFormComponent,
    ModalNotificationComponent
  ]
})
export class AppModule { }
