const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const listWithZeroBlog = []

  const listWithTwoBlogs = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
      _id: '845hjjsd9f85lkjlsdf98590',
      title: 'Beep Boop This is a Blog Post',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/BeepBoop.pdf',
      likes: 10,
      __v: 0
    }
  ]

  test ('list with 1 blog, should equal the same likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test ('list with zero blogs, should have 0 likes', () => {
    const result = listHelper.totalLikes(listWithZeroBlog)
    assert.strictEqual(result, 0)
  })

  test ('list with 2 blogs should equal 15', () => {
    const result = listHelper.totalLikes(listWithTwoBlogs)
    assert.strictEqual(result,15)
  })
})

describe('most likes', () => {
  const listWithTwoBlogs = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    },
    {
      _id: '845hjjsd9f85lkjlsdf98590',
      title: 'Beep Boop This is a Blog Post',
      author: 'Edsger W. Dijkstra',
      likes: 10,
    },
    {
      _id: 'w53453ytghfgty85678ydgyd',
      title: 'Why Beef Stew is Important in America',
      author: 'Edsger W. Dijkstra',
      likes: 20,
    }
  ]

  test('returns beef stew has most likes', () => {
    const result = listHelper.favoriteBlog(listWithTwoBlogs)
    assert.deepStrictEqual(result, 20)
  })
})