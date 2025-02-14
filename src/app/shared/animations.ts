import {
  trigger,
  animate,
  transition,
  style,
  query, stagger
} from '@angular/animations';


export const insertAnimation = trigger('insertAnimation', [
    transition('* <=> *', [
      query(':enter',
        [style({ opacity: 0 }), stagger('100ms', animate('300ms ease-out', style({ opacity: 1 })))],
        { optional: true })
      ])
  ]);


export const insertRemoveAnimation = trigger('insertRemoveAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms', style({ opacity: 0 }))
  ])
]);

export const fadeAnimation = trigger('fadeAnimation', [
  // The '* => *' will trigger the animation to change between any two states
  transition('* => *', [
    // The query function has three params.
    // First is the event, so this will apply on entering or when the element is added to the DOM.
    // Second is a list of styles or animations to apply.
    // Third we add a config object with optional set to true, this is to signal
    // angular that the animation may not apply as it may or may not be in the DOM.
    query(
      ':enter',
      [style({ opacity: 0 })],
      { optional: true }
    ),
    query(
      ':leave',
      // here we apply a style and use the animate function to apply the style over 0.3 seconds
      [style({ opacity: 1 }), animate('0.3s', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);

export const fadeInStagger = trigger('fadeInStagger', [
  transition('* => *', [ // each time the binding value changes
    query(':enter', [
      style({opacity: 0, transform: 'translateY(12px)'}),
      stagger(100, [
        animate('300ms', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ], {optional: true })
  ])
]);
export const fadeInSlideUp = trigger('fadeInSlideUp', [
  transition(':enter', [
    style({opacity: 0, transform: 'translateY(12px)'}),
    animate('300ms ease-out', style({opacity: 1, transform: 'translateY(0)'})),
  ])
]);
