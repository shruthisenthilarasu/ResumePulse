# ResumePulse Full-Stack Application Setup Guide

This guide will help you set up and run the ResumePulse full-stack application.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key
- Git

## Project Structure

```
ResumePulse/
├── backend/          # Express/TypeScript API
├── frontend/         # React/TypeScript frontend
├── README.md
└── SETUP.md
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resumepulse?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_CUSTOM_GPT_ID=g-694f75c6d7e881918aedfd76c37a1a6f

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb resumepulse

# Run migrations
npm run prisma:generate
npm run prisma:migrate
```

### 4. Create Uploads Directory

```bash
mkdir -p uploads
```

### 5. Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The backend API will be available at `http://localhost:3001`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running the Application

1. **Start PostgreSQL** (if not running as a service)

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open Browser:**
   Navigate to `http://localhost:3000`

## Usage

1. **Register/Login**: Create an account or login
2. **Upload Resume**: Upload a PDF resume
3. **Create Analysis**: Select target role and analyze
4. **View Results**: See structured feedback with signals, suggestions, and examples

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Resumes
- `POST /api/resumes` - Upload resume (multipart/form-data)
- `GET /api/resumes` - Get all resumes for user
- `GET /api/resumes/:id` - Get single resume
- `DELETE /api/resumes/:id` - Delete resume

### Analyses
- `POST /api/analyses` - Create analysis
  ```json
  {
    "resumeId": "uuid",
    "targetRole": "Software Engineer" // optional
  }
  ```
- `GET /api/analyses` - Get all analyses for user
- `GET /api/analyses/:id` - Get single analysis
- `DELETE /api/analyses/:id` - Delete analysis

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update user profile

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 3001) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_CUSTOM_GPT_ID` | Your Custom GPT ID | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Verify database exists: `psql -l`

### OpenAI API Issues
- Verify API key is correct
- Check API key has sufficient credits
- Ensure Custom GPT ID is correct

### File Upload Issues
- Check `UPLOAD_DIR` exists and is writable
- Verify `MAX_FILE_SIZE` is appropriate
- Ensure file is valid PDF

### CORS Issues
- Verify `FRONTEND_URL` matches your frontend URL
- Check backend CORS configuration

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper database connection
4. Set up file storage (S3/GCS recommended)
5. Use process manager (PM2, systemd)

### Frontend
1. Build: `npm run build`
2. Serve with nginx or similar
3. Configure API proxy

## Next Steps

- Add email notifications
- Implement subscription management
- Add resume comparison feature
- Enhance PDF processing
- Add more analysis metrics

## Support

For issues or questions, please refer to the main README or open an issue on GitHub.

