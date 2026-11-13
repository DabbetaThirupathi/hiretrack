const router = require("express").Router();
const Application = require("../models/Application");
const Drive = require("../models/Drive");
const { STATUSES } = require("../models/Application");
const { protect, authorize } = require("../middleware/auth");
const { ApiError, asyncHandler } = require("../middleware/error");
const { checkEligibility } = require("../utils/eligibility");

router.use(protect);

// POST /api/applications  { driveId }  (student)
router.post(
  "/",
  authorize("student"),
  asyncHandler(async (req, res) => {
    const drive = await Drive.findById(req.body.driveId);
    if (!drive) throw new ApiError(404, "Drive not found");

    const { eligible, reasons } = checkEligibility(req.user, drive);
    if (!eligible) throw new ApiError(400, `Not eligible: ${reasons.join("; ")}`);

    const application = await Application.create({
      student: req.user._id,
      drive: drive._id,
      history: [{ status: "applied", note: "Application submitted" }],
    });
    res.status(201).json(application);
  })
);

// GET /api/applications/me  (student)
router.get(
  "/me",
  authorize("student"),
  asyncHandler(async (req, res) => {
    const apps = await Application.find({ student: req.user._id })
      .populate("drive", "company role ctc location jobType driveDate deadline")
      .sort({ createdAt: -1 });
    res.json(apps);
  })
);

// DELETE /api/applications/:id  (student withdraws while still "applied")
router.delete(
  "/:id",
  authorize("student"),
  asyncHandler(async (req, res) => {
    const app = await Application.findOne({ _id: req.params.id, student: req.user._id });
    if (!app) throw new ApiError(404, "Application not found");
    if (app.status !== "applied") throw new ApiError(400, "You can only withdraw before shortlisting");
    await app.deleteOne();
    res.json({ message: "Application withdrawn" });
  })
);

// GET /api/applications/drive/:driveId?status=  (admin)
router.get(
  "/drive/:driveId",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const filter = { drive: req.params.driveId };
    if (req.query.status) filter.status = req.query.status;
    const apps = await Application.find(filter)
      .populate("student", "name email rollNo branch cgpa backlogs phone skills resumeUrl")
      .sort({ createdAt: 1 });
    res.json(apps);
  })
);

// PATCH /api/applications/:id/status  { status, note }  (admin)
router.patch(
  "/:id/status",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    if (!STATUSES.includes(status)) throw new ApiError(400, `Status must be one of: ${STATUSES.join(", ")}`);
    const app = await Application.findById(req.params.id);
    if (!app) throw new ApiError(404, "Application not found");
    app.status = status;
    app.history.push({ status, note });
    await app.save();
    res.json(app);
  })
);

// PATCH /api/applications/bulk-status  { ids: [], status }  (admin)
router.patch(
  "/bulk-status",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { ids, status, note } = req.body;
    if (!Array.isArray(ids) || !ids.length) throw new ApiError(400, "ids must be a non-empty array");
    if (!STATUSES.includes(status)) throw new ApiError(400, "Invalid status");
    const result = await Application.updateMany(
      { _id: { $in: ids } },
      { $set: { status }, $push: { history: { status, note, at: new Date() } } }
    );
    res.json({ updated: result.modifiedCount });
  })
);

module.exports = router;
