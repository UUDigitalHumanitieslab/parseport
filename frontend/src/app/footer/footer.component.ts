import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
    selector: 'pp-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    environment = environment;

}
