const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-master');

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return true;

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        console.log('Please make sure MongoDB is running or set up a cloud MongoDB connection.');
        console.log('You can use MongoDB Atlas (free tier) or install MongoDB locally.');
        console.log('For local MongoDB: https://www.mongodb.com/try/download/community');
        console.log('For MongoDB Atlas: https://www.mongodb.com/atlas');

        // Don't exit the process, let the server continue without database
        // This allows the frontend to work and show appropriate error messages
        return false;
    }
};

module.exports = connectDB;
