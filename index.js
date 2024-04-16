const config = require('./utils/config')
const app = require('./app.js')

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})