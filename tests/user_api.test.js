const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { after, test, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const User = require("../models/user")
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user in the db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'bombardini',
            name: 'Bombardini Gussini',
            password: 'B_G?12;ni'
        }

        await api.post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(user => user.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username is already taken', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'root',
            name: 'admin root',
            password: 'admi_234/90'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDB()

        assert(result.body.error.includes('expected `username` to be unique'))
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})
after(async () => {
    await mongoose.connection.close()
})
