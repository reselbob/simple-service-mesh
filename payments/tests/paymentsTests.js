'use strict';
const supertest = require('supertest');
const expect = require('chai').expect;
const describe = require('mocha').describe;
const it = require('mocha').it;
const _ = require('lodash')

const {server,shutdown} = require('../index');

const getProducts = () =>{
    const products = [];
    let id = 1;
    let category = 'Music';
    let description = 'The Greatest Hits of Beethoven';
    let price = 9.99;
    products.push({id, category, description, price});

    id = 2;
    category = 'Food';
    description = 'Brie Cheese';
    price = 39.99;
    products.push({id, category, description, price});

    id = 2;
    category = 'Clothes';
    description = 'Silk Pajamas';
    price = 159.99;
    products.push({id, category, description, price});

    return products;
}

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

const getPayment = () => {
    const product = _.sample(getProducts());
    const customer = _.sample(getCustomers());
    const purchaseDate = Date.now();

    return {customer, product,purchaseDate}
}

describe('Payments Tests: ', () => {
    after( () => {
        shutdown();
    });

    it('Can access GET items', async () =>{
        for(let i = 0; i<10;i++){
            const payload = getPayment();
            await supertest(server)
                .post('/api/')
                .set('Accept', 'application/json')
                .send(payload)
                .then((res) => {
                    console.log(res.body);
                })
        }

        await supertest(server)
            .get('/api/')
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.eq(10);
                console.log(res.body);
            })
    });

    it('Can access POST item', async () => {
        const payload = getPayment();
        await supertest(server)
            .post('/api/')
            .set('Accept', 'application/json')
            .send(payload)
            .then((res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.payment.customer.firstName).to.eq(payload.customer.firstName);
                expect(res.body.payment.product.description).to.eq(payload.product.description);
                expect(res.body.payment.id).to.be.a('string');
                expect(res.body.status).to.eq(200);
                console.log(res.body);
            })
    });
});
