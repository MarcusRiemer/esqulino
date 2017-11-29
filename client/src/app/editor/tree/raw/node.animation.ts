import { trigger, state, style, animate, transition } from '@angular/animations';

const DEFAULT_ANIMATION_METHOD = "300ms linear";

export const DROP_TARGET_ANIMATION = trigger('dropTarget', [
  state('none', style({
    backgroundColor: 'white',
  })),
  state('available', style({
    backgroundColor: 'lime',
  })),
  state('self', style({
    backgroundColor: 'yellow',
  })),
  // Fade in and out
  transition('none <=> available', animate(DEFAULT_ANIMATION_METHOD)),
  transition('none <=> self', animate(DEFAULT_ANIMATION_METHOD)),

  // Transition between shown states
  transition('available => self', animate(DEFAULT_ANIMATION_METHOD)),
  //transition('self => available', animate(DEFAULT_ANIMATION)),
]);

export const DROP_PLACEHOLDER_ANIMATION = trigger('dropPlaceholder', [
  state('none', style({
    transform: 'scaleY(0.0)',
    height: '0px',
    display: 'none',
    backgroundColor: 'white',
  })),
  state('available', style({
    transform: 'scaleY(1.0)',
    height: 'auto',
    display: 'block',
    backgroundColor: 'lime',
  })),
  state('self', style({
    transform: 'scaleY(1.0)',
    height: 'auto',
    display: 'block',
    backgroundColor: 'yellow',
  })),
  // Fade in and out
  transition('none <=> available', animate(DEFAULT_ANIMATION_METHOD)),
  transition('none <=> self', animate(DEFAULT_ANIMATION_METHOD)),

  // Transition between shown states
  transition('available => self', animate(DEFAULT_ANIMATION_METHOD)),
]);


