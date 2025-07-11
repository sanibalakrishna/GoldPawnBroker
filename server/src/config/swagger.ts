// config/swagger.ts
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gold Pawn Broker API',
      version: '1.0.0',
      description: 'API for managing gold pawn broker operations including particulars, transactions, and dashboard analytics',
      contact: {
        name: 'API Support',
        email: 'support@goldpawnbroker.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              description: 'Email address'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Particular: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Particular ID'
            },
            name: {
              type: 'string',
              description: 'Name of the particular (jeweller/customer)'
            },
            contactNumber: {
              type: 'string',
              description: 'Contact phone number'
            },
            address: {
              type: 'string',
              description: 'Address'
            },
            identityDocument: {
              type: 'string',
              description: 'Identity document details'
            },
            totalAssets: {
              type: 'number',
              description: 'Total metal assets value'
            },
            totalCash: {
              type: 'number',
              description: 'Total cash value'
            },
            totalIncoming: {
              type: 'number',
              description: 'Total incoming transactions'
            },
            totalOutgoing: {
              type: 'number',
              description: 'Total outgoing transactions'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID'
            },
            particularId: {
              type: 'string',
              description: 'Reference to particular'
            },
            transactionType: {
              type: 'string',
              enum: ['cash', 'metal'],
              description: 'Type of transaction'
            },
            transactionFlow: {
              type: 'string',
              enum: ['incoming', 'outgoing'],
              description: 'Flow direction of transaction'
            },
            quantity: {
              type: 'number',
              description: 'Quantity of item/cash'
            },
            rate: {
              type: 'number',
              description: 'Rate per unit (for metal transactions)'
            },
            percentage: {
              type: 'number',
              description: 'Quality percentage (for metal transactions)'
            },
            total: {
              type: 'number',
              description: 'Total transaction amount'
            },
            description: {
              type: 'string',
              description: 'Transaction description'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Error details'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and user management'
      },
      {
        name: 'Particulars',
        description: 'Manage particulars (jewellers/customers)'
      },
      {
        name: 'Transactions',
        description: 'Manage transactions'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and analytics'
      }
    ]
  },
  apis: [
    path.resolve(__dirname, '../routes/*.ts'),
    path.resolve(__dirname, '../models/*.ts')
  ]
};

export const swaggerSpec = swaggerJsdoc(options);