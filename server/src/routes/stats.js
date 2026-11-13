const router = require("express").Router();
const User = require("../models/User");
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const { protect, authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/error");

// GET /api/stats  (admin) - placement dashboard numbers
router.get(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const [totalStudents, totalDrives, openDrives, totalApplications] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Drive.countDocuments(),
      Drive.countDocuments({ status: "open", deadline: { $gte: new Date() } }),
      Application.countDocuments(),
    ]);

    // Offers joined with drive CTC to compute placed students and packages.
    const offers = await Application.aggregate([
      { $match: { status: "selected" } },
      { $lookup: { from: "drives", localField: "drive", foreignField: "_id", as: "drive" } },
      { $unwind: "$drive" },
      { $lookup: { from: "users", localField: "student", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      {
        $group: {
          _id: "$student._id",
          branch: { $first: "$student.branch" },
          bestCtc: { $max: "$drive.ctc" },
          offers: { $sum: 1 },
        },
      },
    ]);

    const placedStudents = offers.length;
    const ctcs = offers.map((o) => o.bestCtc);
    const avgCtc = ctcs.length ? +(ctcs.reduce((a, b) => a + b, 0) / ctcs.length).toFixed(2) : 0;
    const highestCtc = ctcs.length ? Math.max(...ctcs) : 0;

    const studentsByBranch = await User.aggregate([
      { $match: { role: "student", branch: { $ne: null } } },
      { $group: { _id: "$branch", total: { $sum: 1 } } },
    ]);
    const placedByBranch = offers.reduce((acc, o) => {
      acc[o.branch] = (acc[o.branch] || 0) + 1;
      return acc;
    }, {});
    const branchWise = studentsByBranch
      .map((b) => ({
        branch: b._id,
        total: b.total,
        placed: placedByBranch[b._id] || 0,
        percentage: +(((placedByBranch[b._id] || 0) / b.total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const statusCounts = await Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const topCompanies = await Application.aggregate([
      { $match: { status: "selected" } },
      { $lookup: { from: "drives", localField: "drive", foreignField: "_id", as: "drive" } },
      { $unwind: "$drive" },
      { $group: { _id: "$drive.company", hires: { $sum: 1 }, ctc: { $max: "$drive.ctc" } } },
      { $sort: { hires: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalStudents,
      totalDrives,
      openDrives,
      totalApplications,
      placedStudents,
      placementRate: totalStudents ? +((placedStudents / totalStudents) * 100).toFixed(1) : 0,
      avgCtc,
      highestCtc,
      branchWise,
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      topCompanies: topCompanies.map((c) => ({ company: c._id, hires: c.hires, ctc: c.ctc })),
    });
  })
);

module.exports = router;
