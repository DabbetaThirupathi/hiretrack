const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    company: { type: String, required: [true, "Company is required"], trim: true },
    role: { type: String, required: [true, "Role is required"], trim: true },
    description: { type: String, trim: true },
    ctc: { type: Number, required: [true, "CTC (LPA) is required"], min: 0 },
    location: { type: String, trim: true },
    jobType: { type: String, enum: ["Full-time", "Internship", "Internship + PPO"], default: "Full-time" },
    eligibility: {
      minCgpa: { type: Number, min: 0, max: 10, default: 0 },
      branches: [{ type: String }], // empty array = all branches
      maxBacklogs: { type: Number, min: 0, default: 0 },
      graduationYear: { type: Number }, // optional batch restriction
    },
    deadline: { type: Date, required: [true, "Application deadline is required"] },
    driveDate: { type: Date },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, deadline: 1 });

module.exports = mongoose.model("Drive", driveSchema);
