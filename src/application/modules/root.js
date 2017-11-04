import Vue from 'vue';

// components
import {alertsComponent} from 'application/components/alerts'

/**
 * Class to use as root of application
 */
export class Root {
    constructor(element) {
        this.alertsComponent = alertsComponent;
        this.app = new Vue({
            el: element || '#application'
        });
    }
}

export const root = new Root();