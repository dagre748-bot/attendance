const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const post = (url, data, headers = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) reject({ status: res.statusCode, body: parsed });
          else resolve(parsed);
        } catch (e) {
          reject({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
};

async function test() {
  try {
    console.log('Logging in as teacher...');
    const loginRes = await post('http://localhost:5000/api/auth/login', {
      email: 'yadnesh@gmail.com',
      password: 'password'
    });
    const teacherToken = loginRes.token;

    const studentId = '9f3aa4d5-ad7e-4e22-b93e-e73379c09818'; // Student One
    const subjectId = 'ea47aa78-fe91-4a2d-b4bc-cf4218c06cbb'; // S4

    // Generate a valid JWT QR token
    const qrToken = jwt.sign({ studentId, timestamp: Date.now() }, JWT_SECRET);

    console.log(`Simulating scan for Student ${studentId} and Subject ${subjectId}...`);
    const scanRes = await post('http://localhost:5000/api/attendance/mark', 
      { qrToken, subjectId },
      { Authorization: `Bearer ${teacherToken}` }
    );

    console.log('Scan response:', JSON.stringify(scanRes, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
