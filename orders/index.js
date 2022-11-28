const express = require('express');
const app = express();
const {logger} = require("./logger");
const _ = require('lodash')
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
process.title = 'simple_service_mesh_orders'

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const orders = [];

//Get URLs of external services

const validateService = async (service, url) => {
    const response = await axios.get(url)
        .then(function (response) {
            console.log(response);
            return response.status;
        })
        .catch(function (error) {
            //console.log(error);
            throw new Error(`${service} is not active. Error message: ${error.message}`);
        })
}

if(!process.env.PAYMENTS_URL) throw new Error('No value defined for the required environment variable PAYMENTS_URL');
if(!process.env.RECOMMENDATIONS_URL) throw new Error('No value defined for the required environment variable RECOMMENDATIONS_URL');

validateService('Payments', process.env.PAYMENTS_URL);
validateService('Recommendations', process.env.RECOMMENDATIONS_URL);

const port = process.env.SERVER_PORT || 8080;
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

app.get('/:id', async(req, res) => {
    let order = _.find(orders, (obj) => {
        if (obj.id === req.params.id )return true;
    });
    res.status(200).send(order);
});

app.get('/', async(req, res) => {
    res.status(200).send(orders);
});

app.post('/', async(req, res) => {
    const data = req.body;
    //post to payments
    const paymentResult = await axios.post(process.env.PAYMENTS_URL, data);
    // get recommendation
    const recommendation = await axios.get(process.env.RECOMMENDATIONS_URL);
    const result = {payment: paymentResult.data.payment, recommendation:recommendation.data }
    result.id = uuidv4();
    orders.push(result);
    logger.info(`Posting ${JSON.stringify(result)}`);
    res.status(200).send({status: 200, order: result});
});

server = app.listen(port, () => {
    logger.info(`Payments service is running on port ${port} at ${new Date()}`);
});

const shutdown = () => {
    server.close()
}

module.exports = {server, shutdown};
