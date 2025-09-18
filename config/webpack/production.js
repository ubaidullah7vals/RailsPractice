process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const environment = require('./environment')
const optimization = require('./optimization')

module.exports = optimization.toWebpackConfig()
