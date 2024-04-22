const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = blogs.reduce((accumulator, currentBlog) => {
    return accumulator + currentBlog.likes
  }, 0)
  
  return sum
}

const favoriteBlog = (blogs) => {
  const maxVal = blogs.reduce((maxVal, currentBlog) => {
    return Math.max(maxVal, currentBlog.likes)
  }, 0)

  return maxVal
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}