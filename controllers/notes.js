const notesRouter = require('express').Router()
const Note = require('../models/note')

// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

notesRouter.get('/', async (request, response) => {
  let notes = await Note.find({})
  response.json(notes)
})

notesRouter.get('/:id', async (request, response, next) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.delete('/:id', async (request, response, next) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.post('/', async (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false
  })

  const savedNote = await note.save()

  response.status(201).json(savedNote)
  
  // catch(error => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findById(request.params.id).then(note => {
    if (!note) {
      return response.status(404).end()
    }
    note.content = content
    note.important = important
    return note.save().then(updatedNote => {
      response.json(updatedNote)
    })
  }).catch(error => next(error))
})

module.exports = notesRouter