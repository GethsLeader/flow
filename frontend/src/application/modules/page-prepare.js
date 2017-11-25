// icons
import iconSVG from 'application/images/icon.svg';
import iconPNG from 'application/images/icon.png';
import iconText from 'application/data/icon-text.txt';

import {logger} from 'application/modules/logger';

/**
 * Class to decorate page with icons, initial elements stats and etc.
 */
export class PagePrepare {
    constructor() {
        this.iconPNG = iconPNG;
        this.iconSVG = iconSVG;
        this.iconText = iconText;
        // output application text icon in console
        logger.log(this.iconText);
    }

    init() {
        logger.debug('Setting up icon to page...');
        let link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = this.iconPNG;
        document.getElementsByTagName('head')[0].appendChild(link);
        return Promise.resolve();
    }
}