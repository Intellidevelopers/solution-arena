// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Solution Market Arena",
      version: "1.0.0",
      description: "API documentation for Solution Market Arena",
    },
    servers: [
      {
        url: "http://localhost:5000/api", // Change to your base URL when deployed
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your API route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
