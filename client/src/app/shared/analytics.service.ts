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
 * Encapsulates tracking actions.
 */
@Injectable()
export class AnalyticsService {
  constructor(private _tracking: Angulartics2) {}

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
