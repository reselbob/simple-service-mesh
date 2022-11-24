const express = require('express');
const app = express();
const {logger} = require("./logger");
const _ = require('lodash')
const e = require("express");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
process.title = 'simple_service_mesh_payments'

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const payments = [];
/**
 * Converts the request.rawHeaders array into a JSON object
 *
 * @param arr
 * @returns {{}} a JSON object that reports the raw header information
 * in the request
 */
const parseRawHeader = (arr)=> {
    let obj = {};
    let currentKey='';
    for(let i=0; i < arr.length; i++){
        if (i % 2 == 0){
            //this is the key
            currentKey = arr[i];
            obj[currentKey]='';
        }else
        {
            obj[currentKey]=arr[i]
        }
    }
    return obj;
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    const rawHeadersJson = parseRawHeader(req.rawHeaders);
    logger.info(JSON.stringify({requestInfo: rawHeadersJson}));
    next();
});

const port = process.env.SERVER_PORT || 8080;


app.get('/api/:id', async(req, res) => {
    res.status(500).send({message: 'Not Implemented'});
});

app.get('/api/', async(req, res) => {
    res.status(200).send(payments);
});

app.post('/api/', async(req, res) => {
    const data = req.body;
    data.id = uuidv4();
    payments.push(data);
    logger.info(`Posting ${JSON.stringify(data)}`);

    res.status(200).send({status: 200, payment: data});
});

server = app.listen(port, () => {
    logger.info(`Payments service is running on port ${port} at ${new Date()}`);
});

const shutdown = () => {
    server.close()
}

module.exports = {server, shutdown};