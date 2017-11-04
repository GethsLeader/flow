import Vue from 'vue';
import config from 'application/config.json';
import template from './template.html';
import {logger} from '../../modules/logger';
import {Utils} from 'application/modules/utils';

/**
 * Available types of alerts
 * @type {{ERROR: number, WARNING: number, SUCCESS: number, INFO: number, DEFAULT: number}}
 */
export const AlertTypes = {
    ERROR: 1,
    WARNING: 2,
    SUCCESS: 3,
    INFO: 4,
    DEFAULT: 5
};

/**
 * Alert class
 */
class Alert {
    /**
     * @param type {number} Type of alert, should be one of AlertTypes object fields (enum). Default value is DEFAULT
     * @param message {string}
     * @param title {string} It's alert title (huge font, on the alert form top and etc), can be empty
     * @param delay {number} Time in ms, before alert will disappear
     */
    constructor(type, message, title, delay) {
        logger.debug(`[Alert] object creation with type "${type}", with message "${message}", with title "", on delay "${delay}"`);
        if (!message) {
            throw new Error('ERROR_NO_EMPTY_ALERT_MESSAGE');
        }
        if (delay !== 0) {
            this.delay = delay || config.alerts.defaultDisappearDelay || 0;
        }
        this.type = type || AlertTypes.DEFAULT;
        this.message = message;
        this.title = title;
        this.id = Utils.createUID(); // random id on construction
        this.timeout = null; // it's need later to workaround alert remove properly
    }
}

/**
 * Alerts service class
 */
class Alerts {
    constructor() {
        logger.debug(`[Alerts] component creation...`);
        this.list = [];
    }

    find(id) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].id === id) {
                return this.list[i];
            }
        }
        return null;
    }

    remove(id) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].id === id) {
                if (this.list[i].timeout) {
                    clearTimeout(this.list[i].timeout);
                }
                this.list.splice(i, 1);
                return id;
            }
        }
        return null;
    }

    add(type, message, title, delay) {
        const alert = new Alert(type, message, title, delay);
        this.list.push(alert);
        if (alert.delay > 0) {
            alert.timeout = setTimeout(this.remove.bind(this, alert.id), alert.delay);
        }
    }
}

/**
 * Alerts service instance
 * @type {Alerts}
 */
export const alerts = new Alerts();


/**
 * Alerts component
 * Should be use only once, because it's depend on singleton service instance
 */
export const alertsComponent = Vue.component('alerts', {
    template: template,
    data: function () {
        return {
            alerts: alerts,
            AlertTypes: AlertTypes
        }
    }
});