var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/app.css",
      "stylesheets/AdminLTE.min.css"
    ]
  }),
  networks: {
    development: {
      network_id: "*",
      gas: 4000000,
      host: 'localhost',
      port: '8545'
    }
  }
};
