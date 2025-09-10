require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Get the jobs collection
    const db = mongoose.connection.db;
    const jobsCollection = db.collection('jobs');
    
    // Count total jobs
    const totalJobs = await jobsCollection.countDocuments();
    console.log(`📊 Total jobs in database: ${totalJobs}`);
    
    // Get all jobs
    const jobs = await jobsCollection.find({}).toArray();
    
    if (jobs.length > 0) {
      console.log('\n📋 Jobs found:');
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company} (ID: ${job._id})`);
        console.log(`   Posted by: ${job.postedBy}`);
        console.log(`   Created: ${job.createdAt}`);
        console.log(`   Active: ${job.isActive}`);
        console.log('');
      });
    } else {
      console.log('❌ No jobs found in database');
    }
    
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  });
