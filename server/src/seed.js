// Demo data. Run manually with `npm run seed`, or it is loaded
// automatically on first start when the database is empty.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Drive = require("./models/Drive");
const Application = require("./models/Application");

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seedDemoData() {
  await Promise.all([User.deleteMany({}), Drive.deleteMany({}), Application.deleteMany({})]);

  const admin = await User.create({ name: "Placement Officer", email: "admin@hiretrack.dev", password: "admin123", role: "admin" });

  const studentData = [
    ["Ananya Rao", "ananya@hiretrack.dev", "21IT001", "IT", 8.9, 0],
    ["Rahul Verma", "rahul@hiretrack.dev", "21CSE014", "CSE", 7.6, 0],
    ["Sneha Reddy", "sneha@hiretrack.dev", "21ECE022", "ECE", 6.8, 1],
    ["Kiran Kumar", "kiran@hiretrack.dev", "21IT037", "IT", 7.2, 0],
    ["Priya Sharma", "priya@hiretrack.dev", "21AIML005", "AIML", 9.1, 0],
    ["Vikram Singh", "vikram@hiretrack.dev", "21MECH019", "MECH", 6.4, 2],
  ];
  const students = [];
  for (const [name, email, rollNo, branch, cgpa, backlogs] of studentData) {
    students.push(
      await User.create({
        name, email, rollNo, branch, cgpa, backlogs,
        password: "student123",
        graduationYear: 2026,
        skills: ["Java", "SQL", "React"],
      })
    );
  }

  const drives = await Drive.insertMany([
    {
      company: "Infosys", role: "Systems Engineer", ctc: 3.6, location: "Bengaluru", jobType: "Full-time",
      description: "Training-based role for graduate engineers in software development.",
      eligibility: { minCgpa: 6.0, branches: [], maxBacklogs: 1, graduationYear: 2026 },
      deadline: days(10), driveDate: days(15), createdBy: admin._id,
    },
    {
      company: "Zoho", role: "Software Developer", ctc: 8.4, location: "Chennai", jobType: "Full-time",
      description: "Build products used by millions. Strong problem solving required.",
      eligibility: { minCgpa: 7.0, branches: ["CSE", "IT", "AIML"], maxBacklogs: 0, graduationYear: 2026 },
      deadline: days(5), driveDate: days(8), createdBy: admin._id,
    },
    {
      company: "Cognizant", role: "GenC Next", ctc: 6.75, location: "Hyderabad", jobType: "Full-time",
      description: "Full stack development track.",
      eligibility: { minCgpa: 7.5, branches: ["CSE", "IT", "ECE", "AIML"], maxBacklogs: 0 },
      deadline: days(-2), driveDate: days(-1), status: "closed", createdBy: admin._id,
    },
    {
      company: "Amazon", role: "SDE Intern", ctc: 12, location: "Hyderabad", jobType: "Internship + PPO",
      description: "6-month internship with pre-placement offer.",
      eligibility: { minCgpa: 8.0, branches: ["CSE", "IT", "AIML"], maxBacklogs: 0 },
      deadline: days(20), createdBy: admin._id,
    },
  ]);

  const [infosys, zoho, cognizant] = drives;
  const app = (student, drive, status) => ({
    student: student._id, drive: drive._id, status,
    history: [{ status: "applied", note: "Application submitted" }, ...(status !== "applied" ? [{ status }] : [])],
  });
  await Application.insertMany([
    app(students[0], cognizant, "selected"),
    app(students[1], cognizant, "selected"),
    app(students[3], cognizant, "rejected"),
    app(students[4], cognizant, "selected"),
    app(students[0], zoho, "shortlisted"),
    app(students[2], infosys, "applied"),
    app(students[3], infosys, "interview"),
  ]);

  console.log("Demo data loaded.");
  console.log("Admin   -> admin@hiretrack.dev / admin123");
  console.log("Student -> ananya@hiretrack.dev / student123");
}

module.exports = { seedDemoData };

// When run directly (`npm run seed`): connect, reset, seed, disconnect.
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(seedDemoData)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
