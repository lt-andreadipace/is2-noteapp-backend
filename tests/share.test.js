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

describe("POST /v1/share/public/:noteId", () => {

    let token, userIds, noteId;

    beforeAll(async () => {
        let email = "testPublic@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { "rootFolder._id": 1 })
        noteId = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body._id
    });

    test("POST /v1/share/public/:noteId successful", async () => {
        let response = await request(app).post("/v1/share/public/"+noteId.valueOf())
            .set('Authorization', "Bearer " + token)
        let publicNote = (await User.findOne({ _id: userIds._id.valueOf(), "documents._id": noteId }, { "documents.$": 1 })).documents[0]
        return expect({ status: response.status, shared: publicNote.shared }).toEqual({ status: 200, shared: true });
    });
});

describe("POST /v1/share/private/:noteId", () => {

    let token, userIds, noteId;

    beforeAll(async () => {
        let email = "testPrivate@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { "rootFolder._id": 1 })
        noteId = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body._id
        await request(app).post("/v1/share/public/"+noteId.valueOf())
            .set('Authorization', "Bearer " + token)
    });

    test("POST /v1/share/private/:noteId successful", async () => {
        let response = await request(app).post("/v1/share/private/"+noteId.valueOf())
            .set('Authorization', "Bearer " + token)
        let privateNote = (await User.findOne({ _id: userIds._id.valueOf(), "documents._id": noteId }, { "documents.$": 1 })).documents[0]
        return expect({ status: response.status, shared: privateNote.shared }).toEqual({ status: 200, shared: false });
    });
});

describe("GET /v1/share/share/:userId/:noteId", () => {

    let viewerToken, ownerUserIds, noteId;

    beforeAll(async () => {
        let owner = "testOwner@email.it"
        let viewer = "testViewer@email.it"
        await User.findOneAndDelete({ email: owner });
        await User.findOneAndDelete({ email: viewer });
        let ownerToken = (await request(app).post("/v1/auth/register")
            .send({
                email: owner,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        viewerToken = (await request(app).post("/v1/auth/register")
            .send({
                email: viewer,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        ownerUserIds = await User.findOne({ email: owner }, { "rootFolder._id": 1 })
        noteId = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: ownerUserIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + ownerToken))._body._id
        await request(app).post("/v1/share/public/"+noteId.valueOf())
            .set('Authorization', "Bearer " + ownerToken)
    });

    test("GET /v1/share/share/:userId/:noteId successful", async () => {
        let response = await request(app).get("/v1/share/share/" + ownerUserIds._id.valueOf() + "/" + noteId.valueOf())
            .set('Authorization', "Bearer " + viewerToken)
        return expect({ status: response.status, sharedNote: response._body._id }).toEqual({ status: 200, sharedNote: noteId });
    });
});

describe("GET /v1/share", () => {

    let viewerToken, ownerUserIds, viewerUserId, note;

    beforeAll(async () => {
        let owner = "testOwner@email.it"
        let viewer = "testViewer@email.it"
        await User.findOneAndDelete({ email: owner });
        await User.findOneAndDelete({ email: viewer });
        let ownerToken = (await request(app).post("/v1/auth/register")
            .send({
                email: owner,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        viewerToken = (await request(app).post("/v1/auth/register")
            .send({
                email: viewer,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        ownerUserIds = await User.findOne({ email: owner }, { "rootFolder._id": 1 })
        viewerUserId = await User.findOne({ email: viewer }, { _id: 1 })
        note = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: ownerUserIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + ownerToken))._body
        await request(app).post("/v1/share/public/"+note._id.valueOf())
            .set('Authorization', "Bearer " + ownerToken)
        await request(app).get("/v1/share/share/" + ownerUserIds._id.valueOf() + "/" + note._id.valueOf())
            .set('Authorization', "Bearer " + viewerToken)
    });

    test("GET /v1/share successful", async () => {
        let response = await request(app).get("/v1/share")
            .set('Authorization', "Bearer " + viewerToken)
        let sharedNotesLen = (await User.findOne({ _id: viewerUserId.valueOf() }, { _id: 0, sharedWithMe: 1 })).sharedWithMe.length
        let toCheck = {
            name: note.name,
            userid: ownerUserIds._id.valueOf(),
            noteid: note._id.valueOf()
        }
        return expect({ status: response.status, length: response.body.length, sharedNote: response._body[0] }).toEqual({ status: 200, length: sharedNotesLen, sharedNote: toCheck });
    });
});