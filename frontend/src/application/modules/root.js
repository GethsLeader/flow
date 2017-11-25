import Vue from 'vue';
import VueResource from 'vue-resource'

// modules
Vue.use(VueResource);

// components
import {alertsComponent} from 'application/components/alerts'
import {authComponent} from 'application/components/auth'

/**
 * Class to use as root of application
 */
export class Root {
    constructor(element) {
        this.alertsComponent = alertsComponent;
        this.authComponent = authComponent;
        this.app = new Vue({
            el: element || '#application'
        });
    }
}

export const root = new Root();