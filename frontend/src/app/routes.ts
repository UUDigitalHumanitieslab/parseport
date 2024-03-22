import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SpindleComponent } from './spindle/spindle.component';
import { AethelComponent } from './aethel/aethel.component';

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
        path: 'æthel',
        component: AethelComponent,
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
