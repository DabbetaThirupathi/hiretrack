const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIML", "DS"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email is invalid"],
    },
    password: { type: String, required: true, minlength: [6, "Password must be at least 6 characters"], select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },

    // Student academic profile (used for eligibility checks)
    rollNo: { type: String, trim: true },
    branch: { type: String, enum: BRANCHES },
    cgpa: { type: Number, min: 0, max: 10 },
    backlogs: { type: Number, min: 0, default: 0 },
    graduationYear: { type: Number },
    phone: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    resumeUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
module.exports.BRANCHES = BRANCHES;
