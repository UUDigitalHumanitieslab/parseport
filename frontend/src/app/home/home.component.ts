import { Component, OnInit } from '@angular/core';
import { BackendService } from './../services/backend.service';

@Component({
  selector: 'dh-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    hooray?: string;

    constructor(private backend: BackendService) { }

    ngOnInit(): void {
        // This is just an example call to /api/example/
        this.backend.get('example').then(hoorays => {
            if (hoorays.length) {
                this.hooray = hoorays[0].message;
            }
        });
    }

}
