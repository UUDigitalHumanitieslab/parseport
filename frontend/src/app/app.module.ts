import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';

@NgModule({
    declarations: [
        AppComponent,
        FooterComponent,
        MenuComponent,
        HomeComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'csrftoken',
            headerName: 'X-CSRFToken'
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
