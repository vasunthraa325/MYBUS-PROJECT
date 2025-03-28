const crypto = require("crypto");
const express = require("express");
const mysql = require("mysql2");
const path = require('path'); 
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
 app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data



app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});



// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "$ENTH!LKUM@R_13a",
  database: "mybus_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.post('/login', async (req, res) => {
  console.log("🔹 Login Route Hit");

  const { email, password } = req.body;
  console.log("🔹 Entered Email:", email);
  console.log("🔹 Entered Password:", password);

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    console.log("🔹 Query Results:", results);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    const user = results[0];
    console.log("🔹 Stored Hashed Password:", user.password);

    const match = await bcrypt.compare(password, user.password);
    console.log("🔹 Password Match Result:", match);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    res.json({ message: "Login successful!", userId: user.id });
  });
});

// Signup API
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received Data:", req.body);

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("❌ MySQL Error:", err);
        return res.status(500).json({ message: "Signup failed!" });
      }
      res.status(200).json({ message: "User registered successfully!" });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ HASH FUNCTION
function computeHash(source, destination, time) {
  const formattedTime = time.trim().padStart(5, "0"); // Ensure "HH:mm" format
  const data = `${source.trim().toLowerCase()}-${destination.trim().toLowerCase()}-${formattedTime}`;

  console.log("🔹 Data for Hashing:", data);
  return crypto.createHash("sha256").update(data, "utf-8").digest("hex");
}

// Search Bus API
app.post("/search-bus", (req, res) => {
  const { source, destination, time } = req.body;

  if (!source || !destination || !time) {
    return res.status(400).json({ error: "Source, destination, and time are required!" });
  }

  // Compute the hash
  const computedHash = computeHash(source, destination, time);
  console.log("🔹 Computed Hash:", computedHash);

  // Fetch stored hashes from DB for comparison
  const query = `SELECT source, destination, TIME_FORMAT(time, '%H:%i') AS formatted_time, hashed_route_number 
                 FROM bus_routes 
                 WHERE source = ? AND destination = ? AND TIME_FORMAT(time, '%H:%i') = ?`;

  db.query(query, [source, destination, time], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      console.log("⚠ No matching record found in DB.");
      return res.status(404).json({ message: "No bus route found!" });
    }

    // Extract stored hash
    const storedHash = results[0].hashed_route_number;
    console.log("🔹 Stored Hash from DB:", storedHash);

    // Compare computed hash with stored hash
    if (computedHash !== storedHash) {
      console.log("❌ Hash Mismatch!");
      return res.status(404).json({ message: "No bus route found (Hash mismatch)!" });
    }

    console.log("✅ Hash Matched! Bus route found.");
    res.json(results);
  });
});
const PORT = 3000;
// Start Server

app.post("/search-bus", (req, res) => {
  let { source, destination, time } = req.body;

  let query = "SELECT source, destination, formatted_time FROM buses WHERE source=? AND destination=? AND formatted_time=?";
  db.query(query, [source, destination, time], (err, result) => {
      if (err) {
          console.error("Database Error:", err);
          res.status(500).json({ error: "Database error" });
      } else {
          res.json(result); // Send data without hashed_route_number
      }
  });
});


app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});



