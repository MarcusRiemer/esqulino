import { Component } from '@angular/core'
import { Platform } from '@angular/cdk/platform';

/**
 * A clickable link in the side navigation.
 */
export interface NavLink {
  type: "link",
  text: string; // The text to display
  route: string[];
  icon?: string;
}

/**
 * A faint horizontal divider
 */
export interface NavDivider {
  type: "divider"
}

export type NavItem = NavLink | NavDivider;

@Component({
  templateUrl: 'templates/index.html',
})
export class FrontComponent {

  constructor(public readonly platform: Platform) { }

  public readonly isMobile = this.platform.IOS || this.platform.ANDROID;

  readonly navItems: NavItem[] = [
    {
      type: "link",
      text: "Hauptseite",
      route: ["/about/"],
      icon: "home"
    },
    {
      type: "link",
      text: "Beispielprojekte",
      route: ["/about/projects"],
      icon: "cubes"
    },
    {
      type: "divider"
    },
    {
      type: "link",
      text: "Forschung",
      route: ["/about/academia"],
      icon: "flask"
    },
    {
      type: "link",
      text: "Impressum",
      route: ["/about/imprint"],
      icon: "file-text-o"
    },
    {
      type: "link",
      text: "Datenschutz",
      route: ["/about/privacy"],
      icon: "user-secret"
    },
  ];
}
