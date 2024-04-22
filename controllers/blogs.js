const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({})
  .populate('user')

  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const blog = request.body
  const user = request.user

  if (blog.likes === undefined) {
    blog.likes = 0
  }

  if(blog.title === undefined || blog.url === undefined) {
    return response.status(400).end()
  }

  const post = new Blog({
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    user: user.id
  })
  const result = await post.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()
  response.status(201).json(result)

})

blogsRouter.delete('/:id', async (request, response) => {
  // make sure token matches the user.
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const blog = await Blog.findById(request.params.id)

  if (decodedToken.id.toString() !== blog.user.toString()) {
    return response.status(401).json({ error: 'only the person that added the note can delete it'})
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const post = {
    likes: body.likes
  }
  const updatedPost = await Blog.findByIdAndUpdate(request.params.id, post, { new: true })
  response.json(updatedPost)
})

module.exports = blogsRouter