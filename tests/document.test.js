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

describe("POST /v1/notes", () => {

    let token, userIds;

    beforeAll(async () => {
        let email = "testCreate@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { _id: 1, "rootFolder._id": 1 })
    });

    test("POST /v1/notes successful", async () => {
        let toCreate = {
            name: "name",
            parent: userIds.rootFolder._id.valueOf()
        }
        let response = await request(app).post("/v1/notes")
            .send(toCreate)
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token)
        let createdNote = (await User.findOne({ _id: userIds._id.valueOf(), "documents.name": toCreate.name }, { "documents.$": 1 })).documents[0]
        let toCheck = {
            _id: createdNote._id.valueOf(),
            name: toCreate.name,
            content: "{\"ops\":[]}",
            updated: createdNote.updated.toISOString(),
            created: createdNote.created.toISOString(),
            parent: toCreate.parent,
            shared: false,
            starred: false,
        }
        return expect({ status: response.status, note: JSON.parse(response.text) }).toEqual({ status: 200, note: toCheck });
    });
});

describe('GET /v1/notes', () => {

    let token, userIds, note;

    beforeAll(async () => {
        let email = "testNotes@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { _id: 1, "rootFolder._id": 1 })
        note = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body
    });

    test('GET /v1/notes successful', async () => {
        let response = await request(app).get("/v1/notes")
            .set('Authorization', "Bearer " + token)
        let notesLen = (await User.findOne({ _id: userIds._id.valueOf() }, { _id: 0, documents: 1 })).documents.length
        return expect({ status: response.status, length: response._body.documents.length, note: response._body.documents[0] }).toEqual({ status: 200, length: notesLen, note: note })
    });
});

describe('GET /v1/notes/:noteid', () => {

    let token, note;

    beforeAll(async () => {
        let email = "testNote@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        let parentId = (await User.findOne({ email: email }, { _id: 1, "rootFolder._id": 1 })).rootFolder._id
        note = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: parentId.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body
    });

    test('GET /v1/notes/:noteid successful', async () => {
        let response = await request(app).get("/v1/notes/" + note._id.valueOf())
            .set('Authorization', "Bearer " + token)
        return expect({ status: response.status, note: response._body }).toEqual({ status: 200, note: note })
    });
});

describe('PUT /v1/notes/:noteid', () => {

    let token, userIds, note;

    beforeAll(async () => {
        let email = "testUpdate@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { _id: 1, "rootFolder._id": 1 })
        note = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body
    });

    test('PUT /v1/notes/:noteid successful', async () => {
        let edits = {
            newname: "newName",
            newparent: note.parent,
            newcontent: [{ insert: "content" }]
        }
        let response = await request(app).put("/v1/notes/" + note._id.valueOf())
            .send(edits)
            .set('Authorization', "Bearer " + token)
        let newUpdated = (await User.findOne({ _id: userIds._id.valueOf(), "documents._id": note._id }, { "documents.updated": 1 })).documents[0].updated
        let toCheck = {
            _id: note._id.valueOf(),
            name: edits.newname,
            content: "{\"ops\":[{\"insert\":\"content\"}]}",
            updated: newUpdated.toISOString(),
            created: note.created,
            parent: edits.newparent,
            shared: false,
        }
        return expect({ status: response.status, note: response._body }).toEqual({ status: 200, note: toCheck })
    });
});

describe('DELETE /v1/notes/:noteid', () => {

    let token, userIds, noteId;

    beforeAll(async () => {
        let email = "testDelete@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { _id: 1, "rootFolder._id": 1 })
        noteId = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body._id
    });

    test('DELETE /v1/notes/:noteid successful', async () => {
        let response = await request(app).delete("/v1/notes/" + noteId.valueOf())
            .set('Authorization', "Bearer " + token)
        let deletedNote = (await User.findOne({ _id: userIds._id.valueOf(), "documents._id": noteId }, { "documents.$": 1 }))
        return expect({ status: response.status, deletedNote: deletedNote }).toEqual({ status: 200, deletedNote: null })
    });
});