# NeutroPak Backend API

A production-ready Express.js TypeScript backend API for the NeutroPak application.

## Project Structure

```
Neutro_backend/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── routes/                # API route handlers
│   │   ├── auth.ts           # Authentication routes
│   │   ├── users.ts          # User management routes
│   │   ├── products.ts       # Product routes
│   │   └── orders.ts         # Order routes
│   ├── controllers/           # Business logic (placeholder)
│   ├── middleware/            # Custom middleware (placeholder)
│   ├── models/                # Data models (placeholder)
│   ├── utils/                 # Utility functions
│   │   └── constants.ts      # API constants
│   └── types/                 # TypeScript types
│       └── index.ts          # Shared interfaces
├── dist/                      # Compiled JavaScript
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
├── .eslintrc.json            # ESLint rules
├── .gitignore                # Git exclusions
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- MongoDB (optional, for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/developer-bytespak/NeutroPak_backend.git
cd NeutroPak_backend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your environment in `.env`:
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
DATABASE_URL=mongodb://localhost:27017/neutropak
```

### Development

Run the development server with auto-reload:
```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:3001`

### Build

Create an optimized production build:
```bash
npm run build
# or
yarn build
```

### Production

Start the production server:
```bash
npm start
# or
yarn start
```

### Linting

Check code quality:
```bash
npm run lint
# or
yarn lint
```

### Type Checking

Run TypeScript compiler check:
```bash
npm run type-check
# or
yarn type-check
```

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## Key Features

- ✅ **Express.js**: Web framework for Node.js
- ✅ **TypeScript**: Full type safety
- ✅ **CORS**: Cross-Origin Resource Sharing enabled
- ✅ **Helmet**: Security headers
- ✅ **Morgan**: HTTP request logger
- ✅ **Error Handling**: Global error middleware
- ✅ **Environment Configuration**: .env support

## Technologies Used

- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Runtime**: Node.js
- **Logging**: Morgan
- **Security**: Helmet, CORS
- **Linting**: ESLint

## Exception Handling

The API includes global error handling middleware that catches and formats errors:

```typescript
// Errors are automatically caught and returned as:
{
  error: "Error type",
  message: "Error description"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration time |
| `DATABASE_URL` | - | MongoDB connection string |

## Contributing

1. Create a feature branch
2. Commit your changes with clear messages
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue on GitHub.
