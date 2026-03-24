const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "data", "submissions.json");

// Ensure file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

// 🔐 LOGIN (simple hardcoded admin)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    req.session.user = "admin";
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// 🔒 PROTECT ADMIN
function isAuth(req, res, next) {
  if (req.session.user) next();
  else res.status(401).send("Unauthorized");
}

// 📩 SAVE DATA
app.post("/submit", (req, res) => {
  const newData = req.body;

  fs.readFile(DATA_FILE, (err, data) => {
    let json = [];

    try {
      json = JSON.parse(data);
    } catch {}

    json.push({
      ...newData,
      time: new Date().toLocaleString()
    });

    fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), () => {
      res.json({ message: "Saved" });
    });
  });
});

// 📊 GET DATA (ADMIN ONLY)
app.get("/data", isAuth, (req, res) => {
  const data = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(data));
});

// 🚪 LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});
