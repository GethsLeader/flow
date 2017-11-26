// IMPORTS
const express = require('express');
const router = express.Router();

// ROUTES
module.exports = router
    .get('/', function (req, res) {
        return res.send('MAIN PAGE PLACEHOLDER');
    });