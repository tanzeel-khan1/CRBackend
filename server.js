const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const { documentStorage } = require('./config/cloudinaryConfig');
connectDB();

const app = express();
const server = http.createServer(app);

// CORS allow all
app.use(cors({
  origin: function (origin, callback) {
    // allow tools like Postman (no origin) + allowed domains
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

const allowedOrigins = [
  "http://localhost:7000",
  "https://tynvora.netlify.app"
];
app.use(express.json({ limit: '50mb' }));
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
  res.json({
    file_url: req.file.path,
    file_type: req.file.mimetype,
    file_size: req.file.size,
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'InvestorOS API is running' });
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