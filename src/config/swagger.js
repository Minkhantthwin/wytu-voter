const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wytu Voting API',
      version: '1.0.0',
      description: 'API documentation for Wytu King & Queen Voting App',
      contact: {
        name: 'Admin',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Candidate: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            photoUrl: { type: 'string' },
            category: { type: 'string', enum: ['king', 'queen'] },
            voteCount: { type: 'integer' },
          },
        },
        Vote: {
          type: 'object',
          properties: {
            kingId: { type: 'integer' },
            queenId: { type: 'integer' },
          },
          required: ['kingId', 'queenId'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
          required: ['email', 'password'],
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            admin: { $ref: '#/components/schemas/Admin' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Public', description: 'Public endpoints for voting' },
      { name: 'Admin', description: 'Admin authentication endpoints' },
      { name: 'Candidates', description: 'Candidate management' },
      { name: 'Votes', description: 'Voting operations' },
      { name: 'Results', description: 'Vote results' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
