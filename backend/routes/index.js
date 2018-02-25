// IMPORTS
const express = require('express');
const router = express.Router();

// ROUTES
router
    .get('/', async (req, res, next) => {
        await req.app.modules.static.pass('/index.html', req, res, next);
    });

// EXPORTS
module.exports = router;
