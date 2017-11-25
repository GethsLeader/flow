import Vue from 'vue';
import config from 'application/config.json';
import template from './template.html';
import {logger} from 'application/modules/logger';
import {alerts, AlertTypes} from 'application/components/alerts';
import {Utils} from 'application/modules/utils';

/**
 * Login form class (Auth service subclass)
 */
class LoginForm {
    /**
     * @param auth {Auth} Link to parent of this subclass, to get access to parent's fields and methods
     */
    constructor(auth) {
        this.auth = auth;
        this.url = `${config.auth.url}/login`;
        this.username = '';
        this.password = '';
    }

    login() {
        logger.debug(`[Auth] login started for "${this.username}"...`);
        Promise.resolve()
            .then(() => {
                if (!this.username.trim()) {
                    throw new Error('ERROR_EMPTY_USERNAME');
                }
                if (!this.password) {
                    throw new Error('ERROR_EMPTY_PASSWORD');
                }
                return Vue.http.post(this.url, {
                    username: this.username.trim(),
                    password: this.password
                });
            })
            .then((res) => {
                logger.debug(`[Auth] user "${res.body.username}" login was successful!`);
                this.username = '';
                this.auth.user = res.body;
                alerts.add(AlertTypes.SUCCESS, 'Successful login!', 'Auth');
            })
            .catch((res) => {
                const error = Utils.response2Error(res);
                logger.error(error);
                if (error.message.indexOf('ERROR_') !== 0) {
                    error.message = 'ERROR_UNKNOWN';
                }
                // TODO: [3] should to process errors here more nicely xD
                alerts.add(AlertTypes.ERROR, error.message, 'Auth');
            })
            .then(() => {
                this.password = '';
            });
    }
}

/**
 * Auth service class
 */

class Auth {
    constructor() {
        logger.debug('[Auth] object creation with configuration:', config.auth);
        this.loginForm = new LoginForm(this);
        logger.debug('[Auth] login form initialized...');
        this.user = null; // empty user at initialization
    }
}

/**
 * Auth service instance
 * @type {Auth}
 */
export const auth = new Auth();

/**
 * Auth component
 * Should be use only once, because it's depend on singleton service instance
 */
export const authComponent = Vue.component('auth', {
    template: template,
    data: function () {
        return {
            auth: auth
        }
    }
});