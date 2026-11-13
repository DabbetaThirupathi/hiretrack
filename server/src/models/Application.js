const mongoose = require("mongoose");

const STATUSES = ["applied", "shortlisted", "interview", "selected", "rejected"];

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
    status: { type: String, enum: STATUSES, default: "applied" },
    history: [
      {
        status: { type: String, enum: STATUSES },
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// A student can apply to a drive only once.
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
module.exports.STATUSES = STATUSES;
