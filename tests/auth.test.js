const app = require('../app');
const config = require('../config');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = require('../models/userModel');
const User = mongoose.model('User');

let connection;

beforeAll(async () => {
    connection = await config.initDB("testDb");
})

afterAll(async () => {
    await mongoose.connection.close(true);
})

describe("POST /v1/register", () => {

    beforeAll(async () => {
        await User.findOneAndDelete({ email: "test@email.it" });
        await User.findOneAndDelete({ email: "testR@email.it" });
    });

    test("POST /v1/register sucsessful", async () => {
        let userReq = {
            email: "test@email.it",
            name: "name",
            password: "password"
        }

        let response = await request(app).post("/v1/auth/register")
            .send(userReq)
            .set("Accept", "application/json")
        let userIds = await User.findOne({ email: userReq.email }, { _id: 1, "rootFolder._id": 1 })
        let user = {
            _id: userIds._id.valueOf(),
            email: "test@email.it",
            name: "name",
            rootFolder: userIds.rootFolder._id.valueOf()
        }
        let res = jwt.verify(response._body.token, process.env.JWT_SECRET);
        delete res.iat;
        delete res.exp;
        return expect({ status: response.status, user: res }).toEqual({ status: 200, user: user });
    });

    test("POST /v1/register already registered user", async () => {
        let userReq = {
            email: "testR@email.it",
            name: "name",
            password: "password"
        }
        await request(app).post("/v1/auth/register")
            .send(userReq)
            .set("Accept", "application/json")
        let response = await request(app).post("/v1/auth/register")
            .send(userReq)
            .set("Accept", "application/json").expect(400);
        return response
    });
});

describe('POST /v1/login', () => {

    let registeredUsr;

    beforeAll(async () => {
        registeredUsr = {
            name: "name", //Temporary
            email: "test1@email.it",
            password: "password"
        }
        await User.findOneAndDelete({ email: registeredUsr.email });
        await request(app).post("/v1/auth/register")
            .send(registeredUsr)
            .set("Accept", "application/json")
    });

    test('POST /v1/login successful', async () => {
        let response = await request(app).post('/v1/auth/login')
            .send(registeredUsr)
            .set('Accept', 'application/json')

        let userIds = await User.findOne({ email: registeredUsr.email }, { _id: 1, "rootFolder._id": 1 })
        let user = {
            _id: userIds._id.valueOf(),
            email: registeredUsr.email,
            name: registeredUsr.name,
            rootFolder: userIds.rootFolder._id.valueOf()
        }

        let res = jwt.verify(response._body.token, process.env.JWT_SECRET);
        delete res.iat;
        delete res.exp;
        return expect({ status: response.status, user: res }).toEqual({ status: 200, user: user });
    });

    test("POST /v1/login wrong password", async () => {
        let wrongUsr = {
            email: registeredUsr.email,
            password: "wrongPwd"
        }

        return request(app).post("/v1/auth/login")
            .send(wrongUsr)
            .set("Accept", "application/json").expect(403);
    });

});