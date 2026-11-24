// BloodRelay Backend Server - Node.js (No extra install needed)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadDB, saveDB, getDB } = require('./database.js');

loadDB();
const PORT = 3000;

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  const url = req.url.split('?')[0];
  const db = getDB();

  // --- API ROUTES ---
  if (url === '/api/health') return sendJSON(res, 200, { status: 'OK', message: 'BloodRelay Backend Running' });

  if (url === '/api/stats') return sendJSON(res, 200, {
    totalDonors: db.donors.length,
    totalRequests: db.blood_requests.length,
    totalUsers: db.users.length,
    availableDonors: db.donors.filter(d => d.available).length
  });

  if (url === '/api/donors' && req.method === 'GET') return sendJSON(res, 200, db.donors);

  if (url === '/api/donors' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.name || !body.bloodGroup || !body.city) return sendJSON(res, 400, { error: 'Name, BloodGroup, City required' });
    const newDonor = { id: Date.now(), ...body, available: true };
    db.donors.push(newDonor); saveDB();
    return sendJSON(res, 201, { message: 'Donor registered successfully', donor: newDonor });
  }

  if (url === '/api/requests' && req.method === 'GET') return sendJSON(res, 200, db.blood_requests);

  if (url === '/api/requests' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.patientName || !body.bloodGroup) return sendJSON(res, 400, { error: 'Patient Name & Blood Group required' });
    const newReq = { id: Date.now(), ...body, status: 'Pending' };
    db.blood_requests.push(newReq); saveDB();
    return sendJSON(res, 201, { message: 'Blood Request created', request: newReq });
  }

  if (url === '/api/register' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.email || !body.password) return sendJSON(res, 400, { error: 'Email & Password required' });
    if (db.users.find(u => u.email === body.email)) return sendJSON(res, 400, { error: 'User already exists' });
    const newUser = { id: Date.now(), name: body.name || 'User', email: body.email, password: body.password, role: body.role || 'donor', bloodGroup: body.bloodGroup || '' };
    db.users.push(newUser); saveDB();
    return sendJSON(res, 201, { message: 'Registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  }

  if (url === '/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = db.users.find(u => u.email === body.email && u.password === body.password);
    if (!user) return sendJSON(res, 401, { error: 'Invalid email or password' });
    return sendJSON(res, 200, { message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }

  // --- Serve Frontend ---
  let filePath = path.join(__dirname, '..', url === '/' ? 'index.html' : url);
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ BloodRelay Backend running at http://localhost:${PORT}`);
  console.log(`✅ API: http://localhost:${PORT}/api/health`);
});
server.listen(PORT, () => {
  console.log(`✅ BloodRelay Backend running...`);
});


app.listen(PORT, () => {
  console.log(`Server running on ${process.env.PORT || 3000} + PORT`);
});
