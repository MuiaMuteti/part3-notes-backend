const { after, test, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
    beforeEach(async () => {
        await Note.deleteMany({})
        await Note.insertMany(helper.initialNotes)
    })
    
    test('notes are returned as json', async () => {
        await api.get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')
        assert.strictEqual(response.body.length, helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')
        const contents = response.body.map(note => note.content)
        assert.strictEqual(contents.includes('HTML is easy'), true) 
    })

    describe('viewing a specific note', () => {
        test('succeeds with a valid id', async () => {
            const notesAtStart = await helper.notesInDB()
            const noteToView = notesAtStart[0]
            const resultNote = await api
                    .get(`/api/notes/${noteToView.id}`)
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
            
            assert.deepStrictEqual(resultNote.body, noteToView)
        })

        test('fails with statuscode 400 when id is invalid', async () => {
            const invalidID = '5a3d5da59070081a82a3445'
            await api.get(`/api/notes/${invalidID}`).expect(400)
        })
    })

    describe('addition of a new note', () => {
        test('succeeds with valid data', async () => {
            const newNote = {
                content: 'async/await simplifies making async calls',
                important: true
            }
            await api.post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const notesAtEnd = await helper.notesInDB()
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

            const contents = notesAtEnd.map(note => note.content)    
            assert(contents.includes('async/await simplifies making async calls'))
        })

        test('fails with statuscode 400 if data is invalid', async () => {
            const newNote = { important: true }

            await api.post('/api/notes').send(newNote).expect(400)

            const notesAtEnd = await helper.notesInDB()
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
        })
    })

    describe('deletion of a note', () => {
        test('succeeds with statuscode 204 if id is valid', async () => {
            const notesAtStart = await helper.notesInDB()
            const noteToDelete = notesAtStart[0]

            await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

            const notesAtEnd = await helper.notesInDB()

            const contents = notesAtEnd.map(note => note.content)
            assert(!contents.includes(noteToDelete.content))

            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})