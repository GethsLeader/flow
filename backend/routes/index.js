// IMPORTS
const express = require('express');
const router = express.Router();

// ROUTES
if (process.env.NODE_ENV === 'production') {
    router
        .get('/', function (req, res) {
            // Should to serve nothing, because NGINX usage much better, but I think to add basic static server support
            // soon, because for very simple projects, where I will to be lazy to deploy application properly it's will
            // be helpful.
            return res.send('MAIN PAGE PLACEHOLDER');
        });
}

// EXPORTS
module.exports = router;
