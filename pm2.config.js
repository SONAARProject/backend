module.exports = {
  "apps": [
    {
      "name": "sonaar-backend",
      "script": "./dist/index.js",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "PORT": 3001,
        "NODE_ENV": "development"
      },
      "env_production": {
        "PORT": 3001,
        "NODE_ENV": "production"
      }
    }
  ]
}
