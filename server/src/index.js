require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/User");
const { seedDemoData } = require("./seed");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  if ((await User.estimatedDocumentCount()) === 0) {
    console.log("Empty database, loading demo data...");
    await seedDemoData();
  }
  app.listen(PORT, () => console.log(`HireTrack running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
