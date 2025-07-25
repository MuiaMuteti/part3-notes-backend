const Note = require('../models/note')

const initialNotes = [
    {
        content: 'HTML is easy',
        important: false,
    },
    {
        content: 'Browser can execute only JavaScript',
        important: true,
    }
]

const nonExistingId = async () => {
    const note = new Note({ content: 'Will de deleted' })
    await note.save()
    await note.deleteOne()
    return note._id.toString()
}

const notesInDB = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

module.exports = {
    initialNotes, nonExistingId, notesInDB
}