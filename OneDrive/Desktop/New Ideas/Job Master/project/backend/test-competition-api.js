const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCompetitionAPI() {
    console.log('🧪 Testing Competition API endpoints...\n');

    try {
        // Test GET /api/competitions (public)
        console.log('1️⃣ Testing GET /api/competitions (public)');
        const response1 = await fetch(`${API_BASE_URL}/competitions`);
        console.log(`   Status: ${response1.status}`);
        if (response1.ok) {
            const data = await response1.json();
            console.log(`   ✅ Success: Found ${data.data?.length || 0} competitions`);
        } else {
            console.log(`   ❌ Failed: ${response1.statusText}`);
        }

        // Test GET /api/competitions with filters
        console.log('\n2️⃣ Testing GET /api/competitions?type=hackathon (public)');
        const response2 = await fetch(`${API_BASE_URL}/competitions?type=hackathon`);
        console.log(`   Status: ${response2.status}`);
        if (response2.ok) {
            const data = await response2.json();
            console.log(`   ✅ Success: Found ${data.data?.length || 0} hackathon competitions`);
        } else {
            console.log(`   ❌ Failed: ${response2.statusText}`);
        }

        // Test GET /api/competitions/:id (public) - will fail without valid ID
        console.log('\n3️⃣ Testing GET /api/competitions/invalid-id (public)');
        const response3 = await fetch(`${API_BASE_URL}/competitions/invalid-id`);
        console.log(`   Status: ${response3.status}`);
        if (response3.status === 404) {
            console.log('   ✅ Success: Correctly returned 404 for invalid ID');
        } else {
            console.log(`   ⚠️  Unexpected status: ${response3.status}`);
        }

    } catch (error) {
        console.error('❌ Error testing Competition API:', error.message);
    }
}

async function testCertificationAPI() {
    console.log('\n🎓 Testing Certification API endpoints...\n');

    try {
        // Test GET /api/certifications (public)
        console.log('1️⃣ Testing GET /api/certifications (public)');
        const response1 = await fetch(`${API_BASE_URL}/certifications`);
        console.log(`   Status: ${response1.status}`);
        if (response1.ok) {
            const data = await response1.json();
            console.log(`   ✅ Success: Found ${data.data?.length || 0} certifications`);
        } else {
            console.log(`   ❌ Failed: ${response1.statusText}`);
        }

        // Test GET /api/certifications with filters
        console.log('\n2️⃣ Testing GET /api/certifications?type=technical (public)');
        const response2 = await fetch(`${API_BASE_URL}/certifications?type=technical`);
        console.log(`   Status: ${response2.status}`);
        if (response2.ok) {
            const data = await response2.json();
            console.log(`   ✅ Success: Found ${data.data?.length || 0} technical certifications`);
        } else {
            console.log(`   ❌ Failed: ${response2.statusText}`);
        }

        // Test GET /api/certifications/:id (public) - will fail without valid ID
        console.log('\n3️⃣ Testing GET /api/certifications/invalid-id (public)');
        const response3 = await fetch(`${API_BASE_URL}/certifications/invalid-id`);
        console.log(`   Status: ${response3.status}`);
        if (response3.status === 404) {
            console.log('   ✅ Success: Correctly returned 404 for invalid ID');
        } else {
            console.log(`   ⚠️  Unexpected status: ${response3.status}`);
        }

    } catch (error) {
        console.error('❌ Error testing Certification API:', error.message);
    }
}

async function testHealthCheck() {
    console.log('\n🏥 Testing Health Check endpoint...\n');

    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        console.log(`   Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success: ${data.message}`);
            console.log(`   📊 Database: ${data.database}`);
            console.log(`   🌍 Environment: ${data.environment}`);
        } else {
            console.log(`   ❌ Failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error testing Health Check:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests...\n');
    console.log('=' * 50);

    await testHealthCheck();
    await testCompetitionAPI();
    await testCertificationAPI();

    console.log('\n' + '=' * 50);
    console.log('✨ API Tests completed!');
    console.log('\n💡 Note: POST, PUT, DELETE endpoints require authentication');
    console.log('   You can test these with a valid JWT token in the Authorization header');
}

// Run the tests
runTests().catch(console.error); 