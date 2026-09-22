const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const { cloudinary, documentStorage } = require('./config/cloudinaryConfig');
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://ranvola.netlify.app',
  'http://localhost:7000',
  'https://app.tanzilbuilds.xyz'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server tools without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(helmet());

// General API rate limit: 300 requests / 15 min per IP.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
}));

// Stricter limit for auth endpoints (login/register/OTP) to slow brute force.
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  },
  transports: ["websocket", "polling"]
});
require('./socket/chatSocket')(io);

// Static uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// File upload
const upload = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname);
    if (isPdf) return callback(new Error('PDF uploads are temporarily unavailable. Please try again later.'));
    callback(null, true);
  },
});
const { protect } = require('./middleware/auth');

app.post('/api/upload', protect, (req, res, next) => upload.single('file')(req, res, (error) => {
  if (error) {
    const providerMessage = error.error?.message
      || error.message
      || error.toString?.()
      || 'File upload failed';
    console.error('Cloudinary upload failed:', providerMessage);

    const message = providerMessage.toLowerCase().includes('signature')
      ? 'Cloudinary signature rejected. Verify your Cloudinary environment variables.'
      : providerMessage;
    return res.status(400).json({ message });
  }
  next();
}), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const resourceType = req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf'
    ? 'image'
    : 'raw';
  const publicId = req.file.public_id || req.file.filename;
  const fileUrl = publicId
    ? cloudinary.url(publicId, {
      secure: true,
      type: 'upload',
      resource_type: resourceType,
      sign_url: true,
    })
    : req.file.path;

  res.json({
    file_url: fileUrl,
    cloudinary_public_id: publicId,
    file_type: req.file.mimetype,
    file_size: req.file.size,
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Ranvola API is running' });
});

// REST routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/investors', require('./routes/investorRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/idea-comments', require('./routes/ideaCommentRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/doc-sections', require('./routes/docSectionRoutes'));
app.use('/api/passwords', require('./routes/passwordRoutes'));
app.use('/api/send-email', require('./routes/emailRoutes'));
app.use('/api/business-plan', require('./routes/businessPlanRoutes'));
app.use('/api/steps',         require('./routes/stepRoutes'));
app.use('/api/contracts',     require('./routes/contractRoutes'));
app.use('/api/invitations',   require('./routes/invitationRoutes'));
app.use('/api/ai',            require('./routes/aiRoutes'));
app.use('/api/billing',       require('./routes/billingRoutes'));
app.use('/api/goals',       require('./routes/goalRoutes'));
app.use('/api/hpcs',        require('./routes/hpcRoutes'));
app.use("/api/events", require("./routes/eventRoutes"));
app.use(errorHandler);

const { startSubscriptionReminderJob } = require('./jobs/subscriptionReminderJob');
startSubscriptionReminderJob();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));