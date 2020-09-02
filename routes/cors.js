const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) { //returns -1 if the requested item is not in the list
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors(); // Standard cors
exports.corsWithOptions = cors(corsOptionsDelegate); // Specific for routes with restrictions   