const request = require('supertest');
const app = require('./app');

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = require('../models/userModel');  
const User = mongoose.model('User');

const DB_CONNECTION_STRING = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.5lue6.mongodb.net/noteapp?retryWrites=true&w=majority`

/*test('generate a token jwt from user (test@email.it,name,01a)', () => {
    let user = new User({
        email: "test@email.it",
        name: "name",
        _id: "01a"
    });
    expect(jwt.verify(generateToken(user), process.env.JWT_SECRET)).toEqual(user);
});*/

describe('POST /v1/register', () => {

    let response,userId,user;

    beforeAll( async () => { jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(DB_CONNECTION_STRING); });

    afterAll( () => { mongoose.connection.close(true); });

    test('POST /v1/register correct', () => {
        let userClear = {
            email: "test@email.it",
            name: "name",
            password: "password"
        }
        
        response = request(app).post('/v1/register')
        .send(userClear)
        .set('Accept', 'application/json')
        
        userId = app.locals.db.findOne({email: "test@email.it"},{_id:1})._id
        user = {
            _id: userId,
            email: "test@email.it",
            name: "name",
        }

        return response.expect(200,generateToken(user));
    });
});

describe('POST /v1/login', () => {
    let userReq,userId,user;
    beforeAll( async () => { jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(DB_CONNECTION_STRING); 
        userReq = {
            email: "test@email.it",
            password: "password"
        }
        userId = app.locals.db.findOne({email: "test@email.it"},{_id:1})._id
        user = {
            _id: userId,
            email: "test@email.it",
            name: "name",
        }
    });

    afterAll( () => { mongoose.connection.close(true); });

    test('POST /v1/login correct', () => {
        let repsonse = request(app).post('/v1/login')
        .send(user)
        .set('Accept', 'application/json')


        return response.expect(200, user);
    });
});

//.set('Authorization', "Bearer " + token)