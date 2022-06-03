const app = require('../app');
const config = require('../config');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = require('../models/userModel');
const User = mongoose.model('User');

beforeAll(async () => {
    app.locals.db = await config.initDB();
})

afterAll(() => { mongoose.connection.close(true); });

describe("POST /v1/register", () => {

    let userIds, response, user, userReq, res;

    beforeAll(async () => {
        jest.setTimeout(8000);
        await User.findOneAndDelete({ email: "test@email.it" });
        await User.findOneAndDelete({ email: "testR@email.it" });
    });

    test("POST /v1/register correct", async () => {
        userReq = {
            email: "test@email.it",
            name: "name",
            password: "password"
        }

        response = await request(app).post("/v1/auth/register")
            .send(userReq)
            .set("Accept", "application/json")
        userIds = await User.findOne({ email: "test@email.it" }, { _id: 1, "rootFolder._id": 1 })
        user = {
            _id: userIds._id.valueOf(),
            email: "test@email.it",
            name: "name",
            rootFolder: userIds.rootFolder._id.valueOf()
        }
        res = jwt.verify(response._body.token, process.env.JWT_SECRET);
        delete res.iat;
        delete res.exp;
        return expect({ status: response.status, user: res }).toEqual({ status: 200, user: user });
    });

    test("POST /v1/register already registered user", async () => {
        userReq = {
            email: "testR@email.it",
            name: "name",
            password: "password"
        }
        await request(app).post("/v1/auth/register")
            .send(userReq)
            .set("Accept", "application/json")
        response = await request(app).post("/v1/auth/register")
            .send(userReq)
            .set("Accept", "application/json").expect(400);
        return response
    });
});

describe('POST /v1/login', () => {
    let registeredUsr, wrongUsr, userIds, user, response, res;

    beforeAll(async () => {
        jest.setTimeout(8000);
        await User.findOneAndDelete({ email: "test1@email.it" });
        registeredUsr = {
            name: "name", //Temporary
            email: "test1@email.it",
            password: "password"
        }
        await request(app).post("/v1/auth/register")
            .send(registeredUsr)
            .set("Accept", "application/json")
    });

    afterAll(async () => { await User.findOneAndDelete({ email: "test1@email.it" }); });

    test('POST /v1/login correct', async () => {
        response = await request(app).post('/v1/auth/login')
            .send(registeredUsr)
            .set('Accept', 'application/json')

        userIds = await User.findOne({ email: "test1@email.it" }, { _id: 1, "rootFolder._id": 1 })
        delete registeredUsr.name
        user = {
            _id: userIds._id.valueOf(),
            email: "test1@email.it",
            name: "name",
            rootFolder: userIds.rootFolder._id.valueOf()
        }

        res = jwt.verify(response._body.token, process.env.JWT_SECRET);
        delete res.iat;
        delete res.exp;
        return expect({ status: response.status, user: res }).toEqual({ status: 200, user: user });
    });

    test("POST /v1/login wrong password", async () => {
        wrongUsr = {
            email: "test1@email.it",
            password: "wrongPwd"
        }
        
        return request(app).post("/v1/auth/login")
            .send(wrongUsr)
            .set("Accept", "application/json").expect(403);
    });

});

//.set('Authorization', "Bearer " + token)