const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB Atlas connection...');
        console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Not found');

        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in .env file');
            console.log('Please create a .env file with your MongoDB Atlas connection string');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Atlas Connected Successfully!');
        console.log(`📍 Host: ${conn.connection.host}`);
        console.log(`🗄️  Database: ${conn.connection.name}`);

        // Test creating a collection
        const testCollection = mongoose.connection.collection('test');
        await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
        console.log('✅ Database write test successful');

        // Clean up test data
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Database cleanup successful');

        await mongoose.connection.close();
        console.log('🔌 Connection closed');

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your .env file exists in project/backend/');
        console.log('2. Verify your connection string is correct');
        console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
        console.log('4. Check your username and password are correct');
    }
}

testConnection();
