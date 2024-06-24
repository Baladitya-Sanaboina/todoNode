const express = require('express')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())
let db = null

connectDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server is running on 3000`)
    })
  } catch (e) {
    console.log(`Error occured ${e.error}`)
    process.exit(1)
  }
}
connectDbAndServer()

const todoObject = eachItem => {
  return {
    id: eachItem.id,
    todo: eachItem.todo,
    priority: eachItem.priority,
    status: eachItem.status,
  }
}

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const getQuery = `
    SELECT * FROM todo 
    WHERE status LIKE '${status}%' AND priority LIKE '%${priority}%' 
    AND todo LIKE '${search_q}'`
  const getArray = await db.all(getQuery)
  response.send(getArray.map(eachItem => todoObject(eachItem)))
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodo = `
    SELECT * FROM todo WHERE id = ${todoId}
    `
  const arrTodo = await db.get(getTodo)
  response.send(todoObject(arrTodo))
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addTodo = `
    INSERT INTO todo(id, todo, priority, status)
    VALUES(
        ${id}, ${todo}, ${priority}, ${status}
    )`
  await db.run(addTodo)
  response.send('Todo Successfully Added')
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodo = `
    DELETE FROM todo WHERE id = ${todoId}
    `
  await db.run(deleteTodo)
  response.send('Todo Deleted')
})
