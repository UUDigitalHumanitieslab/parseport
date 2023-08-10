import { trigger, style, transition, animate, state } from '@angular/animations';

export type ShowState = 'hide' | 'show';

export const animations = [
    trigger('slideInOut', [
        state('show', style({
            height: '*'
        })),
        state('hide', style({
            height: '0px',
            'padding-top': '0px',
            'padding-bottom': '0px',
            overflow: 'hidden'
        })),
        transition('show => hide', [
            animate('0.2s')
        ]),
        transition('hide => show', [
            animate('0.2s')
        ]),
    ]),

    trigger('visible', [
        state('show', style({ opacity: 1, height: '*' })),
        state('hide', style({ opacity: 0, height: 0 })),
        transition('hide => show', animate('300ms ease-in')),
        transition('show => hide' , animate('300ms ease-out'))
    ])
];
