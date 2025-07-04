const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'reports/cypress',
      overwrite: false,
      html: true,
      json: false,
      timestamp: 'ddmmyyyy_HHMMss'
    },
    setupNodeEvents(on, config) {
      return config
    }
  }
})