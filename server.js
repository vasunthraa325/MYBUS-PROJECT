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
  password: "Vasu@1248",
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

app.get("/get-all-buses", (req, res) => {
  db.query("SELECT * FROM buses", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});


// Search Bus API
app.post("/search-bus", (req, res) => {
  const { source, destination, time } = req.body;
  const query = `
      SELECT route_number, source, destination, bus_type, TIME_FORMAT(time, '%H:%i') AS formatted_time
      FROM bus_routes
      WHERE source = ? AND destination = ? AND time = ?;
  `;

  db.query(query, [source, destination, time], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      console.log("🚀 Fetched Data from MySQL:", results); // Debugging log
      res.json(results);
    }
  });
});


const PORT = 3000;
// Start Server

app.post("/search-bus", (req, res) => {
  const { source, destination, time } = req.body;
  const query = `
      SELECT route_number, source, destination, bus_type, TIME_FORMAT(time, '%H:%i') AS formatted_time
      FROM bus_routes
      WHERE source = ? AND destination = ? AND time = ?;
  `;

  db.query(query, [source, destination, time], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      console.log("🚀 Fetched Data from MySQL:", results); // Debugging log
      res.json(results);
    }
  });
});




app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
