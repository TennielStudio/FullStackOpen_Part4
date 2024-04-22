const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
      "title": "multiplication story",
      "author": "multi",
      "url": "www.multi.com",
      "likes": 100000,
      "_id": "661d310989021f6a2bf6f1cf"
  },
  {
      "title": "addition story",
      "author": "addi",
      "url": "www.addi.com",
      "likes": 100000,
      "_id": "661d316189021f6a2bf6f1d2"
  },
  {
      "title": "division story",
      "author": "omelette writer",
      "url": "www.oooomelette.com",
      "likes": 7878,
      "_id": "661e816a54c5dd28359ac54a"
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(initialBlogs)
})

test('return blogs in json format', async () => {
  await api
    .get('/api/blogs')
    .expect('Content-Type', /application\/json/)
})

test('verify id is not _id', async() => {
  const response = await api.get('/api/blogs')
  
  response.body.forEach(blog => {
    const isThereId = "id" in blog
    assert.strictEqual(isThereId, true)
  })
})

test('verifies post request works', async() => {
  const newBlog = {
    "title": "how to make cheese",
    "author": "mouse",
    "url": "www.ratgirl.com",
    "likes": 898398539
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length +1)
})

test('defaults likes property to zero', async() => {
  const newBlog = {
    "title": "how to make cheese",
    "author": "mouse",
    "url": "www.ratgirl.com"
  }

  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  response.body.forEach(blog => {
    if (blog.title === "how to make cheese") {
      assert.strictEqual(blog.likes, 0)
    }
  })
})

test('displays 400 with no title', async() => {
  const noTitle = {
    "author": "mouse",
    "url": "www.ratgirl.com"
  }

  await api
  .post('/api/blogs')
  .send(noTitle)
  .expect(400)
})

test('displays 400 with no url', async() => {
  const noUrl = {
    "title": "how to make cheese",
    "author": "mouse"
  }

  await api
  .post('/api/blogs')
  .send(noUrl)
  .expect(400)
})

const postsInDb = async () => {
  const posts = await Blog.find({})
  return posts.map(post => post.toJSON())
}

test('tests deleting a specific post', async() => {
  const postsAtStart = await postsInDb()
  const postToDelete = postsAtStart[0]

  await api
    .delete(`/api/blogs/${postToDelete.id}`)
    .expect(204)
  
  const postsAtEnd = await postsInDb()

  const titles = postsAtEnd.map(r => r.title)
  assert(!titles.includes(postToDelete.title))
  assert.strictEqual(postsAtEnd.length, initialBlogs.length-1)
})

test('test updating likes to 7', async () => {
  const blogPosts = await postsInDb()
  const postToUpdate = blogPosts[0]
  const post = {
    "likes": 7
  }

  await api
    .put(`/api/blogs/${postToUpdate.id}`)
    .send(post)
  
  const blogPostsAfter = await postsInDb()
  const likesOfFirstBlog = blogPostsAfter[0].likes
  
  assert.strictEqual(likesOfFirstBlog, 7)
})

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

describe.only('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test.only('username is too short', async () => {
    const usersAtStart = await usersInDb()
    
    const newUser = {
      username: 'ro',
      name: 'supauser',
      password: '123roro'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test.only('password is too short', async () => {
    const usersAtStart = await usersInDb()
    
    const newUser = {
      username: 'roro',
      name: 'supauser',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test.only('password is missing, throw error', async () => {
    const usersAtStart = await usersInDb()
    
    const newUser = {
      username: 'roro',
      name: 'supauser'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test.only('username is missing, throw error', async () => {
    const usersAtStart = await usersInDb()
    
    const newUser = {
      name: 'supauser',
      password: '123rororo'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async() => {
  await mongoose.connection.close()
})
