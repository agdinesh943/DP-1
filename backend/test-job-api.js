require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Test creating a job directly in the database
        const Job = require('./models/Job');
        const User = require('./models/User');

        // First, let's check if there are any users
        const users = await User.find({});
        console.log(`👥 Users found: ${users.length}`);

        if (users.length === 0) {
            console.log('❌ No users found. Please create a user first.');
            await mongoose.disconnect();
            return;
        }

        // Get the first admin user
        const adminUser = users.find(user => user.role === 'admin');
        if (!adminUser) {
            console.log('❌ No admin user found. Please create an admin user first.');
            await mongoose.disconnect();
            return;
        }

        console.log(`👤 Using admin user: ${adminUser.name} (${adminUser.email})`);

        // Create a test job
        const testJob = new Job({
            title: 'Test Software Engineer',
            company: 'Test Company',
            location: 'Test City',
            type: 'Full-time',
            remote: false,
            skills: ['JavaScript', 'React', 'Node.js'],
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            applyLink: 'https://example.com/apply',
            description: 'This is a test job posting to verify the database is working correctly.',
            requirements: 'Experience with modern web technologies',
            benefits: 'Competitive salary and benefits',
            salary: {
                min: 80000,
                max: 120000,
                currency: 'USD',
                period: 'yearly'
            },
            experience: 'Mid Level',
            category: 'Software Development',
            postedBy: adminUser._id,
            isActive: true
        });

        try {
            const savedJob = await testJob.save();
            console.log('✅ Test job created successfully!');
            console.log(`📋 Job ID: ${savedJob._id}`);
            console.log(`📋 Job Title: ${savedJob.title}`);
            console.log(`📋 Company: ${savedJob.company}`);
            console.log(`📋 Posted By: ${savedJob.postedBy}`);

            // Now let's fetch all jobs
            const allJobs = await Job.find({}).populate('postedBy', 'name email');
            console.log(`\n📊 Total jobs in database: ${allJobs.length}`);

            allJobs.forEach((job, index) => {
                console.log(`${index + 1}. ${job.title} at ${job.company}`);
                console.log(`   Posted by: ${job.postedBy?.name || 'Unknown'}`);
                console.log(`   Active: ${job.isActive}`);
                console.log(`   Created: ${job.createdAt}`);
                console.log('');
            });

        } catch (error) {
            console.error('❌ Error creating test job:', error.message);
        }

        // Close connection
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    })
    .catch(err => {
        console.error('❌ Error connecting to MongoDB:', err.message);
        process.exit(1);
    });
