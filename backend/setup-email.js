#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Job Master Email Setup');
console.log('========================\n');

console.log('This script will help you set up email configuration for password reset functionality.\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
} else {
  console.log('❌ .env file not found');
}

console.log('\n📧 Email Configuration Options:\n');
console.log('1. Gmail (Recommended for development)');
console.log('2. SendGrid');
console.log('3. AWS SES');
console.log('4. Mailgun');
console.log('5. Skip email setup for now\n');

rl.question('Choose an option (1-5): ', async (choice) => {
  try {
    switch (choice) {
      case '1':
        await setupGmail();
        break;
      case '2':
        await setupSendGrid();
        break;
      case '3':
        await setupAWSSES();
        break;
      case '4':
        await setupMailgun();
        break;
      case '5':
        console.log('\n⏭️  Skipping email setup. Password reset functionality will not work.');
        console.log('You can configure email later by editing the .env file.');
        break;
      default:
        console.log('\n❌ Invalid choice. Please run the script again.');
    }
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
});

async function setupGmail() {
  console.log('\n📧 Gmail Setup\n');

  console.log('To use Gmail, you need to:');
  console.log('1. Enable 2-Factor Authentication on your Google account');
  console.log('2. Generate an App Password for "Mail"');
  console.log('3. Use the App Password (not your regular password)\n');

  const email = await askQuestion('Enter your Gmail address: ');
  const appPassword = await askQuestion('Enter your Gmail App Password: ');

  const envContent = generateEnvContent({
    EMAIL_USER: email,
    EMAIL_PASSWORD: appPassword,
    FRONTEND_URL: 'http://localhost:5173'
  });

  await writeEnvFile(envContent);

  console.log('\n✅ Gmail configuration saved!');
  console.log('📧 Email User:', email);
  console.log('🔐 App Password: ***configured***');
  console.log('\n🚀 You can now test the email configuration by running:');
  console.log('   npm run test-email');
}

async function setupSendGrid() {
  console.log('\n📧 SendGrid Setup\n');

  const apiKey = await askQuestion('Enter your SendGrid API Key: ');

  const envContent = generateEnvContent({
    SENDGRID_API_KEY: apiKey,
    FRONTEND_URL: 'http://localhost:5173'
  });

  await writeEnvFile(envContent);

  console.log('\n✅ SendGrid configuration saved!');
  console.log('🔑 API Key: ***configured***');
}

async function setupAWSSES() {
  console.log('\n📧 AWS SES Setup\n');

  const accessKey = await askQuestion('Enter your AWS Access Key ID: ');
  const secretKey = await askQuestion('Enter your AWS Secret Access Key: ');
  const region = await askQuestion('Enter your AWS region (e.g., us-east-1): ');

  const envContent = generateEnvContent({
    AWS_ACCESS_KEY_ID: accessKey,
    AWS_SECRET_ACCESS_KEY: secretKey,
    AWS_REGION: region,
    FRONTEND_URL: 'http://localhost:5173'
  });

  await writeEnvFile(envContent);

  console.log('\n✅ AWS SES configuration saved!');
  console.log('🌍 Region:', region);
}

async function setupMailgun() {
  console.log('\n📧 Mailgun Setup\n');

  const apiKey = await askQuestion('Enter your Mailgun API Key: ');
  const domain = await askQuestion('Enter your Mailgun domain: ');

  const envContent = generateEnvContent({
    MAILGUN_API_KEY: apiKey,
    MAILGUN_DOMAIN: domain,
    FRONTEND_URL: 'http://localhost:5173'
  });

  await writeEnvFile(envContent);

  console.log('\n✅ Mailgun configuration saved!');
  console.log('🌐 Domain:', domain);
}

function generateEnvContent(config) {
  const baseConfig = {
    PORT: '5000',
    NODE_ENV: 'development',
    MONGODB_URI: 'mongodb://localhost:27017/job-master',
    JWT_SECRET: 'your-super-secret-jwt-key-here-change-in-production',
    ...config
  };

  return Object.entries(baseConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

async function writeEnvFile(content) {
  const envPath = path.join(__dirname, '.env');

  try {
    fs.writeFileSync(envPath, content);
    console.log('✅ .env file created/updated successfully');
  } catch (error) {
    throw new Error(`Failed to write .env file: ${error.message}`);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Handle script exit
process.on('exit', () => {
  console.log('\n👋 Setup complete! Restart your server for changes to take effect.');
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Setup interrupted. You can run the script again later.');
  process.exit(0);
});
