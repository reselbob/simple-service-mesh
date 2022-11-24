'use strict';
const supertest = require('supertest');
const expect = require('chai').expect;
const describe = require('mocha').describe;
const it = require('mocha').it;
const _ = require('lodash')
const {server, shutdown} = require('../index');

describe('API Tests: ', () => {
    after(() => {
        shutdown();
    });
    it('Can access GET customers', async () => {
        supertest(server)
            .get('/api/')
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.body).to.be.an('array');
                console.log(res.body);
            });
    });

    it('Can access GET customer by id', async () => {
        await supertest(server)
            .get('/api/1')
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.id).to.eq(1);
                console.log(res.body);
            });
    });

    it('Cannot access GET customer by id', async () => {
        await supertest(server)
            .get('/api/tree')
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.body.keys).to.be.eq(undefined)
                console.log(res.body);
            });
    });

    const hasUnique = (arr) => {
        const i = arr[0].id;
        let b = false
        arr.forEach(obj => {
            if(obj.id !== i) b = true;
            return;
        })
        return b
    }

    it('Can access GET random customer', async () => {
        const results = [];
        for(let i = 0; i<10;i++){
            await supertest(server)
                .get('/api/random')
                .set('Accept', 'application/json')
                .then((res) => {
                    results.push(res.body)
                    console.log(res.body);
                });
        }
        const b = hasUnique(results);
        expect(b).to.eq(true);
    });
});
