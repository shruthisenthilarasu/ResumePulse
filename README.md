# ResumePulse: Full-Stack Resume Analytics Application

A complete full-stack application for resume analytics and signal evaluation, integrated with OpenAI Custom GPT.

## 🚀 Features

- **PDF Resume Upload**: Upload and process PDF resumes
- **AI-Powered Analysis**: Integrated with OpenAI Custom GPT for signal-based analysis
- **Role-Aware Feedback**: Analyze resumes for specific roles (Software Engineer, Data Scientist, etc.)
- **Structured Reports**: Get detailed feedback with:
  - Strong signals identification
  - Weak signals and gaps
  - Risk flags
  - Prioritized suggestions
  - Example rewrites
- **User Management**: Authentication, profiles, and usage tracking
- **Real-time Updates**: Polling for analysis status

## 📁 Project Structure

```
ResumePulse/
├── backend/              # Express/TypeScript API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/     # Business logic
│   │   └── middleware/   # Auth middleware
│   ├── prisma/           # Database schema
│   └── package.json
├── frontend/             # React/TypeScript frontend
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # React components
│   │   ├── api/          # API client
│   │   └── store/        # State management
│   └── package.json
├── RESUMEPULSE_SYSTEM_DESIGN.md
├── CUSTOM_GPT_SETUP_GUIDE.md
└── SETUP.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express** and **TypeScript**
- **PostgreSQL** with **Prisma ORM**
- **OpenAI API** for Custom GPT integration
- **JWT** for authentication
- **Multer** for file uploads
- **pdf-parse** for PDF text extraction

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **React Router** for routing
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Dropzone** for file uploads

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Quick Setup

1. **Clone and install:**
   ```bash
   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Set up database:**
   ```bash
   cd backend
   createdb resumepulse
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## 📚 Documentation

- **[System Design](./RESUMEPULSE_SYSTEM_DESIGN.md)**: Complete system architecture
- **[Setup Guide](./SETUP.md)**: Detailed setup instructions
- **[Custom GPT Guide](./CUSTOM_GPT_SETUP_GUIDE.md)**: Custom GPT setup

## 🔗 Links

- **Live Custom GPT**: [ResumePulse on ChatGPT](https://chatgpt.com/g/g-694f75c6d7e881918aedfd76c37a1a6f-resume-pulse)

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Resumes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes` - List user's resumes
- `GET /api/resumes/:id` - Get resume details
- `DELETE /api/resumes/:id` - Delete resume

### Analyses
- `POST /api/analyses` - Create analysis
- `GET /api/analyses` - List user's analyses
- `GET /api/analyses/:id` - Get analysis results
- `DELETE /api/analyses/:id` - Delete analysis

## 🎯 Key Features

### Signal-Based Analysis
- Action verb analysis
- Quantification detection
- Impact categorization
- Clarity assessment
- Role alignment

### Analysis Pipeline
1. Text Normalization
2. Structural Parsing
3. Signal Extraction
4. Metric Computation
5. Interpretation & Findings

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- CORS protection
- Input validation with Zod

## 📊 Database Schema

- **Users**: Authentication and profiles
- **Resumes**: Uploaded resume files and metadata
- **Analyses**: Analysis results and reports

See `backend/prisma/schema.prisma` for full schema.

## 🚧 Development

### Backend
```bash
cd backend
npm run dev        # Development with hot reload
npm run build      # Build for production
npm start          # Run production build
```

### Frontend
```bash
cd frontend
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📦 Deployment

### Backend
- Set `NODE_ENV=production`
- Configure production database
- Use environment variables for secrets
- Set up file storage (S3/GCS)
- Use process manager (PM2)

### Frontend
- Build: `npm run build`
- Serve with nginx or similar
- Configure API proxy

## 🤝 Contributing

This is a full-stack application template. Feel free to extend and customize for your needs.

## 📄 License

MIT

---

**Note**: This application integrates with OpenAI's Custom GPT API. Ensure you have proper API keys and usage limits configured.
