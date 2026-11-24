// BloodRelay Database Layer - JSON File Database
// Tables: users, donors, blood_requests

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

let db = { users: [], donors: [], blood_requests: [] };

// Load DB from file if exists
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    } else {
      // Seed Data - Demo data for evaluation
      db = {
        users: [
          { id: 1, name: "Admin", email: "admin@bloodrelay.com", password: "admin123", role: "admin", bloodGroup: "O+" },
          { id: 2, name: "Sanjana", email: "sanjana@test.com", password: "123456", role: "donor", bloodGroup: "A+" }
        ],
        donors: [
          { id: 1, name: "Sanjana", bloodGroup: "A+", city: "Hyderabad", phone: "9876543210", available: true },
          { id: 2, name: "Rahul", bloodGroup: "O+", city: "Hyderabad", phone: "9876543211", available: true },
          { id: 3, name: "Priya", bloodGroup: "B+", city: "Warangal", phone: "9876543212", available: true }
        ],
        blood_requests: [
          { id: 1, patientName: "Kumar", bloodGroup: "A+", city: "Hyderabad", hospital: "Apollo Hospital", urgency: "Urgent", status: "Pending", contact: "9876500000" }
        ]
      };
      saveDB();
    }
  } catch (e) {
    console.log("DB Load Error:", e.message);
  }
  return db;
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getDB() { return db; }

module.exports = { loadDB, saveDB, getDB };