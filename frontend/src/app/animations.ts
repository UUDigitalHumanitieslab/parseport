import { trigger, style, transition, animate, state } from '@angular/animations';

export type showState = 'hide' | 'show';

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
    ])
];
