import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';
import { SpindleComponent } from './spindle/spindle.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './shared/components/alert/alert.component';
import { AlertContainerDirective } from './shared/directives/alert-container.directive';
import { AlertService } from './shared/services/alert.service';
import { ExportButtonComponent } from './spindle/export-button/export-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SpindleAboutComponent } from './spindle/spindle-about/spindle-about.component';
import { SpindleNotationComponent } from './spindle/spindle-notation/spindle-notation.component';
import { ReferencesComponent } from './references/references.component';

@NgModule({
    declarations: [
        AlertComponent,
        AlertContainerDirective,
        AppComponent,
        FooterComponent,
        HomeComponent,
        MenuComponent,
        SpindleComponent,
        ExportButtonComponent,
        SpindleAboutComponent,
        SpindleNotationComponent,
        ReferencesComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        FontAwesomeModule,
    ],
    providers: [AlertService],
    bootstrap: [AppComponent],
})
export class AppModule {}
