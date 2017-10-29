import 'babel-polyfill';
import 'application/styles/default.scss';

import iconSVG from 'application/images/icon.svg';
import iconPNG from 'application/images/icon.png';
import textIcon from 'application/data/text-icon.txt';

import {applySpecialClick} from 'application/modules/clicker'
import {PagePreparator} from 'application/modules/page-preparator';

const pp = new PagePreparator(iconPNG, iconSVG);

let start = () => {
    pp.init();
    applySpecialClick();
    return Promise.resolve('Let\'s start, I guess?');
};

start()
    .then((startText) => {
        console.log(startText);
        console.log('...');
        console.log(textIcon);
    })
    .catch((error) => {
        console.error(error);
    });

/**
 * HMR
 */
if (module.hot) {
    module.hot.accept('application/modules/clicker', () => {
        applySpecialClick();
    });
}