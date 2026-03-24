const axios = require('axios');

async function test() {
  try {
    // 1. Login as Student
    console.log('Logging in as student...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 's1@gmail.com',
      password: 'password' // Assuming password is 'password', usually it is in these local setups. If not I will check.
    });
    const token = loginRes.data.token;
    console.log('Login successful.');

    // 2. Simulate QR Scan
    // The QR token for a student is just their ID in our new system.
    const studentId = '9f3aa4d5-ad7e-4e22-b93e-e73379c09818';
    const subjectId = 'ea47aa78-fe91-4a2d-b4bc-cf4218c06cbb';

    console.log(`Simulating scan for Student ${studentId} and Subject ${subjectId}...`);
    const scanRes = await axios.post('http://localhost:5000/api/attendance/mark', {
      qrToken: studentId,
      subjectId: subjectId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Scan response:', scanRes.data);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

test();
