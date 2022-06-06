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

describe("POST /v1/folders", () => {

    let token, userIds;

    beforeAll(async () => {
        let email = "testCreateF@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { "rootFolder._id": 1 })
    });

    test("POST /v1/folders successful", async () => {
        let toCreate = {
            name: "name",
            parent: userIds.rootFolder._id.valueOf()
        }
        let response = await request(app).post("/v1/folders")
            .send(toCreate)
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token)
        let createdFolder = (await User.findOne({ _id: userIds._id.valueOf(), "folders.name": toCreate.name }, { "folders.$": 1 })).folders[0]
        let toCheck = {
            _id: createdFolder._id.valueOf(),
            name: toCreate.name,
            created: createdFolder.created.toISOString(),
            parent: toCreate.parent,
        }
        return expect({ status: response.status, folder: JSON.parse(response.text) }).toEqual({ status: 200, folder: toCheck });
    });
});

describe('GET /v1/folders', () => {

    let token, userIds, folder;

    beforeAll(async () => {
        let email = "testFolders@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { "rootFolder._id": 1 })
        folder = (await request(app).post("/v1/folders")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body
    });

    test('GET /v1/folders successful', async () => {
        let response = await request(app).get("/v1/folders")
            .set('Authorization', "Bearer " + token)
        let foldersLen = (await User.findOne({ _id: userIds._id.valueOf() }, { _id: 0, folders: 1 })).folders.length
        return expect({ status: response.status, length: response._body.folders.length, folder: response._body.folders[0] }).toEqual({ status: 200, length: foldersLen, folder: folder })
    });
});

describe('PUT /v1/folders/:folderid', () => {

    let token, folder, newParentId;

    beforeAll(async () => {
        let email = "testUpdateF@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        let parentId = (await User.findOne({ email: email }, { _id: 0, "rootFolder._id": 1 })).rootFolder._id.valueOf()
        folder = (await request(app).post("/v1/folders")
            .send({
                name: "name",
                parent: parentId
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body
        newParentId = (await request(app).post("/v1/folders")
            .send({
                name: "name",
                parent: parentId
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body._id.toISOString
    });

    test('PUT /v1/folders/:folderid successful', async () => {
        let edits = {
            newname: "newName",
            newparent: newParentId,
        }
        let response = await request(app).put("/v1/folders/" + folder._id.valueOf())
            .send(edits)
            .set('Authorization', "Bearer " + token)
        return expect({ status: response.status }).toEqual({ status: 200 })
    });
});

describe('DELETE /v1/folders/:folderid', () => {

    let token, userIds, folderId;

    beforeAll(async () => {
        let email = "testDeleteF@email.it"
        await User.findOneAndDelete({ email: email });
        token = (await request(app).post("/v1/auth/register")
            .send({
                email: email,
                name: "name",
                password: "password"
            })
            .set("Accept", "application/json"))._body.token
        userIds = await User.findOne({ email: email }, { "rootFolder._id": 1 })
        folderId = (await request(app).post("/v1/notes")
            .send({
                name: "name",
                parent: userIds.rootFolder._id.valueOf()
            })
            .set("Accept", "application/json")
            .set('Authorization', "Bearer " + token))._body._id
    });

    test('DELETE /v1/notes/:folderId successful', async () => {
        let response = await request(app).delete("/v1/notes/" + folderId.valueOf())
            .set('Authorization', "Bearer " + token)
        let deletedFolder = (await User.findOne({ _id: userIds._id.valueOf(), "folders._id": folderId }, { "folders.$": 1 }))
        return expect({ status: response.status, deletedFolder: deletedFolder }).toEqual({ status: 200, deletedFolder: null })
    });
});