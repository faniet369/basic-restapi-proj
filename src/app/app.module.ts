import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { FlexLayoutModule } from "@angular/flex-layout";
import { DataTablesModule } from "angular-datatables";
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { BsDropdownModule,BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AccordionModule.forRoot(),
    FlexLayoutModule,
    DataTablesModule,
    ModalModule,
    BsDropdownModule,
    BsDatepickerModule.forRoot(),
    MatSelectModule,
  ],
  providers: [BsModalService, BsDropdownConfig, BsDatepickerConfig,],
  bootstrap: [AppComponent]
})
export class AppModule { }
