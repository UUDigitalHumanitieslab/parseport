import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SpindleComponent } from './spindle/spindle.component';

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'spindle',
        component: SpindleComponent,
    },
    {
        path: 'alpino',
        component: HomeComponent,
    },
    {
        path: 'about',
        component: HomeComponent,
    },
    {
        path: 'links',
        component: HomeComponent,
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];

export { routes };
