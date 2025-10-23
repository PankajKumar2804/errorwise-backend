const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types for error log analysis
  const allowedTypes = [
    'text/plain',
    'text/x-log',
    'application/json',
    'text/javascript',
    'application/javascript',
    'text/x-python-script',
    'text/x-java-source',
    'text/x-c++src',
    'text/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-rust'
  ];

  const allowedExtensions = [
    '.txt', '.log', '.json',
    '.js', '.ts', '.jsx', '.tsx',
    '.py', '.java', '.cpp', '.c', '.h',
    '.php', '.rb', '.go', '.rs'
  ];

  // Check file type
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(fileExtension)) {
    return cb(null, true);
  }

  cb(new AppError('Invalid file type. Only text files, logs, and source code files are allowed.', 400), false);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Error handling for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: 'Too many files. Only one file is allowed.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field.'
      });
    }
  }
  
  next(err);
};

// Single file upload middleware
const uploadSingle = (fieldName = 'file') => {
  return [
    upload.single(fieldName),
    handleMulterError
  ];
};

// Process uploaded file content
const processFileContent = (req, res, next) => {
  if (req.file) {
    try {
      // Convert buffer to string
      const fileContent = req.file.buffer.toString('utf8');
      
      // Add processed content to request
      req.fileContent = fileContent;
      req.fileName = req.file.originalname;
      req.fileSize = req.file.size;
      req.fileMimeType = req.file.mimetype;
      
      // Validate file content
      if (fileContent.length === 0) {
        return res.status(400).json({
          error: 'File is empty or could not be processed.'
        });
      }
      
      // Check for binary content (simple check)
      const isBinary = /[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(fileContent);
      if (isBinary) {
        return res.status(400).json({
          error: 'Binary files are not supported. Please upload text files only.'
        });
      }
      
    } catch (error) {
      return res.status(400).json({
        error: 'Could not process file content. Please ensure it is a valid text file.'
      });
    }
  }
  
  next();
};

module.exports = {
  uploadSingle,
  processFileContent,
  handleMulterError
};