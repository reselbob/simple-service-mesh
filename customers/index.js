const express = require('express');
const app = express();
const {logger} = require("./logger");
const _ = require('lodash')
const e = require("express");
require('dotenv').config()
process.title = 'simple_service_mesh_customers'

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
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


const getCustomers = () =>{
    const customers = [];
    let id = 1;
    let firstName = 'Joe';
    let lastName = 'Jones'
    let email = 'joe.jones@meshymesh.io'
    customers.push({id, firstName, lastName, email});

    id = 2;
    firstName = 'Mary';
    lastName = 'Smith'
    email = 'mary.smith@meshymesh.io'
    customers.push({id, firstName, lastName, email});

    id = 3;
    firstName = 'Darryl';
    lastName = 'Davis'
    email = 'darryl.davis@meshymesh.io'
    customers.push({id, firstName, lastName, email});

    id = 4;
    firstName = 'Nancy';
    lastName = 'Nice'
    email = 'nancy.nice@meshymesh.io'
    customers.push({id, firstName, lastName, email});

    return customers;
}

app.get('/api/:id', async(req, res) => {
    if(req.params.id === 'random'){
        const customers = getCustomers();
        res.status(200).send(_.sample(customers));
        return;
    }
    const customers = getCustomers();
    let customer = _.find(customers, function(obj) {
        if (obj.id === parseInt(req.params.id) )return true;
    });
    res.status(200).send(customer);
});

app.get('/api/', async(req, res) => {
    const customers = getCustomers();
    res.status(200).send(customers);
});

server = app.listen(port, () => {
    logger.info(`Customer service is running on port ${port} at ${new Date()}`);
});

const shutdown = () => {
    server.close()
}

module.exports = {server, shutdown};
