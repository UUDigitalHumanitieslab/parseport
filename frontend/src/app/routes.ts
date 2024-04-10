import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SpindleComponent } from './spindle/spindle.component';
import { SpindleAboutComponent } from './spindle/spindle-about/spindle-about.component';
import { SpindleNotationComponent } from './spindle/spindle-notation/spindle-notation.component';
import { ReferencesComponent } from './references/references.component';

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
        path: 'spindle/about',
        component: SpindleAboutComponent,
    },
    {
        path: 'spindle/notation',
        component: SpindleNotationComponent,
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
        path: 'refs',
        component: ReferencesComponent,
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];

export { routes };
