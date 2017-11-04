import Vue from 'vue';

/**
 * Class to use as root of application
 */
export class Root {
    constructor(element) {
        this.app = new Vue({
            el: element || '#application'
        });
    }
}

export const root = new Root();