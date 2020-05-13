import { Injectable } from "@angular/core";

import { Angulartics2 } from "angulartics2";

export enum TrackCategory {
  BlockEditor = "blockEditor",
}

export interface TrackEvent {
  category: TrackCategory;
  action: string;
  name?: string;
  value?: any;
}

/**
 * Encapsulates all app-specific tracking actions that may occur during runtime.
 * Easy things (such as changed pages) are dealt with automatically.
 */
export abstract class AnalyticsService {
  abstract trackEvent(evt: TrackEvent): void;
}

@Injectable()
export class PiwikAnalyticsService extends AnalyticsService {
  constructor(private _tracking: Angulartics2) {
    super();
  }

  /**
   * Tracks a specific event that has just happened.
   */
  trackEvent(evt: TrackEvent) {
    this._tracking.eventTrack.next({
      action: evt.action,
      properties: {
        category: evt.category,
        name: evt.name,
        value: evt.value,
      },
    });
  }
}

@Injectable()
export class SpecAnalyticsService {
  readonly events: TrackEvent[] = [];

  trackEvent(evt: TrackEvent) {
    this.events.push(evt);
  }
}
