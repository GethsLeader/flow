import 'babel-polyfill';
import 'application/styles/default.scss';
import {logger} from 'application/modules/logger';

// page decorator
import {PagePrepare} from 'application/modules/page-prepare';

// root of application
import {root} from 'application/modules/root';

logger.debug(`[Application] started in "${application.isDevelopment ? 'development' : application.isProduction ? 'production' : 'unknown'}" mode...`);
logger.info(`
Application:
  name: ${application.info.name}
  version: ${application.info.version}
  author: ${application.info.author}
  description: ${application.info.description}
  license: ${application.info.license}
`);

// page prepare instance for init on application start
const pagePrepare = new PagePrepare();

// application start function implementation, for more flexible async methods call
async function start() {
    await pagePrepare.init();
}

// application start
start()
    .then(() => {
        logger.debug('[Application] started.');
    })
    .catch((error) => {
        logger.error(error);
    });