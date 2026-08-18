const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Issue = require('./models/Issue');

dotenv.config();

const listIssues = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    const issues = await Issue.find().populate('reportedBy', 'name email');
    console.log(`Found ${issues.length} issue(s):`);
    issues.forEach(issue => {
      console.log(`- ID: ${issue._id}`);
      console.log(`  Title: ${issue.title}`);
      console.log(`  Status: ${issue.status}`);
      console.log(`  Reported By: ${issue.reportedBy ? `${issue.reportedBy.name} (${issue.reportedBy.email} / ID: ${issue.reportedBy._id})` : 'NULL'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

listIssues();
