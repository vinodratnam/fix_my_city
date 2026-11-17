const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const { SLA_DAYS } = require('../services/slaService');

const router = express.Router();

// ── Cloudinary Configuration ──────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: upload buffer to Cloudinary ──────────────────────────────────────
const uploadToCloudinary = (buffer, folder = 'civicwatch') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ── Multer: memory storage (we stream the buffer to Cloudinary) ───────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// Get all issues
router.get('/', async (req, res) => {
  try {
    const { type, status, department, priority, page = 1, limit = 100 } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// SLA Report — overdue and escalated issues (admin only)
router.get('/sla-report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const now = new Date();

    // All non-resolved issues
    const activeIssues = await Issue.find({
      status: { $in: ['pending', 'in_progress'] },
    }).populate('reportedBy', 'name email');

    const slaReport = activeIssues.map((issue) => {
      const priorityDays = SLA_DAYS[issue.priority || 'medium'];
      const deadline = issue.slaDeadline
        ? new Date(issue.slaDeadline)
        : new Date(new Date(issue.createdAt).getTime() + priorityDays * 24 * 60 * 60 * 1000);

      const msDiff = deadline.getTime() - now.getTime();
      const hoursRemaining = Math.round(msDiff / (1000 * 60 * 60));
      const daysRemaining = Math.round(msDiff / (1000 * 60 * 60 * 24));
      const isOverdue = msDiff < 0;

      return {
        _id: issue._id,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        department: issue.department,
        reportedBy: issue.reportedBy,
        createdAt: issue.createdAt,
        slaDeadline: deadline,
        escalated: issue.escalated,
        isOverdue,
        hoursRemaining,
        daysRemaining,
        slaDays: priorityDays,
        location: issue.location?.address,
      };
    });

    // Sort: most overdue first
    slaReport.sort((a, b) => a.hoursRemaining - b.hoursRemaining);

    const overdue = slaReport.filter(i => i.isOverdue).length;
    const dueSoon = slaReport.filter(i => !i.isOverdue && i.daysRemaining <= 1).length;

    res.json({ report: slaReport, overdue, dueSoon, total: slaReport.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Get issue by ID
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('comments.user', 'name email role')
      .populate('statusHistory.updatedBy', 'name email role');
    
    if (!issue) {
      return res.status(404).json({ message: 'CivicWatch issue not found' });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Create new issue
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);

    const { title, description, type, address, latitude, longitude } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }
    // Image is now optional for testing
    // if (!req.file) {
    //   return res.status(400).json({ message: 'Image is required' });
    // }

    // Upload image to Cloudinary (or use placeholder if no file)
    let imageUrl = 'https://res.cloudinary.com/dxyp1g0l2/image/upload/v1/civicwatch/placeholder.jpg';
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, 'civicwatch/issues');
        console.log('[Cloudinary] Issue image uploaded:', imageUrl);
      } catch (uploadErr) {
        console.error('[Cloudinary] Upload failed, using placeholder:', uploadErr.message);
        // Fallback to picsum placeholder if Cloudinary fails
        imageUrl = 'https://picsum.photos/seed/infrastructure/400/300.jpg';
      }
    }

    const priority = req.body.priority || 'medium';
    const { SLA_LIMITS_MS } = require('../services/slaService');
    const slaMs = SLA_LIMITS_MS[priority] || SLA_LIMITS_MS.medium;
    const slaDeadline = new Date(Date.now() + slaMs);

    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      type,
      location: {
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address.trim()
      },
      imageUrl,
      reportedBy: req.user.id,
      priority,
      slaDeadline,
    });


    await issue.save();
    await issue.populate('reportedBy', 'name email');

    console.log('Issue created successfully:', issue);
    res.status(201).json(issue);
  } catch (err) {
    console.error('Issue creation error:', err);
    res.status(500).json({ 
      message: 'Server error while creating issue',
      error: err.message 
    });
  }
});

// Update issue status (admin only) with comment and after image
router.put('/:id/status', auth, upload.single('afterImage'), async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'CivicWatch issue not found' });
    }

    const previousStatus = issue.status;

    // Add to status history
    issue.statusHistory.push({
      status,
      updatedBy: req.user.id,
      comment: comment || '',
      timestamp: new Date()
    });

    // Update status
    issue.status = status;
    issue.updatedAt = Date.now();

    // Upload after-image to Cloudinary if provided
    if (req.file) {
      try {
        issue.afterImageUrl = await uploadToCloudinary(req.file.buffer, 'civicwatch/resolutions');
        console.log('[Cloudinary] Resolution proof uploaded:', issue.afterImageUrl);
      } catch (uploadErr) {
        console.error('[Cloudinary] After-image upload failed:', uploadErr.message);
        issue.afterImageUrl = 'https://picsum.photos/seed/resolved/400/300.jpg';
      }
    } else if (status === 'resolved') {
      issue.afterImageUrl = 'https://picsum.photos/seed/resolved/400/300.jpg';
    }

    await issue.save();
    await issue.populate('reportedBy', 'name email role');
    await issue.populate('assignedTo', 'name email role');
    await issue.populate('statusHistory.updatedBy', 'name email role');
    await issue.populate('comments.user', 'name email role');

    // ── Socket.io: emit real-time update ─────────────────────────────────────
    const io = req.app.get('io');
    if (io) {
      const statusLabels = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' };
      const payload = {
        issueId: issue._id,
        issueTitle: issue.title,
        newStatus: status,
        previousStatus,
        comment: comment || '',
        updatedAt: issue.updatedAt,
        issue  // full updated issue object
      };

      // Notify the reporter personally
      const reporterId = issue.reportedBy?._id || issue.reportedBy;
      if (reporterId) {
        io.to(`user_${reporterId}`).emit('issueStatusChanged', {
          ...payload,
          message: `Your issue "${issue.title}" is now ${statusLabels[status] || status}`
        });
      }

      // Broadcast to global room (admin dashboards, map views)
      io.to('global').emit('issueUpdated', payload);
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Reject resolution (reporter only)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Rejection reason comment is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only the reporter can reject the resolution
    if (issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the citizen who reported this issue can reject the resolution' });
    }

    if (issue.status !== 'resolved') {
      return res.status(400).json({ message: 'Only resolved issues can be rejected' });
    }

    // Move status back to in_progress
    issue.status = 'in_progress';
    issue.updatedAt = Date.now();
    
    // Add to history
    issue.statusHistory.push({
      status: 'in_progress',
      updatedBy: req.user.id,
      comment: `Resolution Rejected by Citizen: "${comment.trim()}"`,
      timestamp: new Date()
    });

    await issue.save();
    await issue.populate('reportedBy', 'name email role');
    await issue.populate('statusHistory.updatedBy', 'name email role');

    // ── Socket.io: notify admin global room of rejection ─────────────────────
    const io = req.app.get('io');
    if (io) {
      io.to('global').emit('issueUpdated', {
        issueId: issue._id,
        issueTitle: issue.title,
        newStatus: 'in_progress',
        previousStatus: 'resolved',
        comment: `Resolution Rejected by Citizen: "${comment.trim()}"`,
        updatedAt: issue.updatedAt,
        issue
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Accept resolution (reporter only)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only the reporter can accept the resolution
    if (issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the citizen who reported this issue can accept the resolution' });
    }

    if (issue.status !== 'resolved') {
      return res.status(400).json({ message: 'Only resolved issues can be accepted' });
    }

    // Add to history
    issue.statusHistory.push({
      status: 'resolved',
      updatedBy: req.user.id,
      comment: 'Resolution Accepted by Citizen. Closed.',
      timestamp: new Date()
    });

    await issue.save();
    await issue.populate('reportedBy', 'name email role');
    await issue.populate('statusHistory.updatedBy', 'name email role');

    // ── Socket.io: broadcast acceptance to global room ───────────────────────
    const io = req.app.get('io');
    if (io) {
      io.to('global').emit('issueUpdated', {
        issueId: issue._id,
        issueTitle: issue.title,
        newStatus: 'resolved',
        comment: 'Resolution Accepted by Citizen. Closed.',
        updatedAt: new Date(),
        issue
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Get nearby issues
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 5000 } = req.query; // radius in meters

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).populate('reportedBy', 'name email');

    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Upvote issue
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'CivicWatch issue not found' });
    }

    const hasUpvoted = issue.upvotes.includes(req.user.id);
    if (hasUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== req.user.id);
    } else {
      // Add upvote
      issue.upvotes.push(req.user.id);
    }

    await issue.save();
    res.json({ upvoted: !hasUpvoted, upvotes: issue.upvotes.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Add comment to issue
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'CivicWatch issue not found' });
    }

    issue.comments.push({
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    });

    await issue.save();
    await issue.populate('comments.user', 'name email');

    res.json(issue.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Assign department (admin only)
router.put('/:id/department', auth, async (req, res) => {
  try {
    const { department } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { department, updatedAt: Date.now() },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'CivicWatch issue not found' });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Set priority (admin only)
router.put('/:id/priority', auth, async (req, res) => {
  try {
    const { priority } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { priority, updatedAt: Date.now() },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'CivicWatch issue not found' });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

module.exports = router;
