const router = require("express").Router();
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const { protect, authorize } = require("../middleware/auth");
const { ApiError, asyncHandler } = require("../middleware/error");
const { checkEligibility } = require("../utils/eligibility");

const DRIVE_FIELDS = ["company", "role", "description", "ctc", "location", "jobType", "eligibility", "deadline", "driveDate", "status"];
const pickDrive = (body) => Object.fromEntries(DRIVE_FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

router.use(protect);

// GET /api/drives?search=&status=open
// Students also get `eligibility` and `applied` flags for each drive.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ company: rx }, { role: rx }, { location: rx }];
    }
    const drives = await Drive.find(filter).sort({ deadline: 1 }).lean();

    if (req.user.role === "admin") {
      const counts = await Application.aggregate([{ $group: { _id: "$drive", count: { $sum: 1 } } }]);
      const byDrive = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
      return res.json(drives.map((d) => ({ ...d, applicants: byDrive[String(d._id)] || 0 })));
    }

    const myApps = await Application.find({ student: req.user._id }).select("drive status").lean();
    const appliedMap = Object.fromEntries(myApps.map((a) => [String(a.drive), a.status]));
    res.json(
      drives.map((d) => ({
        ...d,
        eligibilityCheck: checkEligibility(req.user, d),
        applicationStatus: appliedMap[String(d._id)] || null,
      }))
    );
  })
);

// GET /api/drives/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const drive = await Drive.findById(req.params.id).lean();
    if (!drive) throw new ApiError(404, "Drive not found");
    if (req.user.role === "student") drive.eligibilityCheck = checkEligibility(req.user, drive);
    res.json(drive);
  })
);

// POST /api/drives  (admin)
router.post(
  "/",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const drive = await Drive.create({ ...pickDrive(req.body), createdBy: req.user._id });
    res.status(201).json(drive);
  })
);

// PUT /api/drives/:id  (admin)
router.put(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const drive = await Drive.findByIdAndUpdate(req.params.id, pickDrive(req.body), { new: true, runValidators: true });
    if (!drive) throw new ApiError(404, "Drive not found");
    res.json(drive);
  })
);

// DELETE /api/drives/:id  (admin) - also removes its applications
router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) throw new ApiError(404, "Drive not found");
    await Application.deleteMany({ drive: drive._id });
    res.json({ message: "Drive deleted" });
  })
);

module.exports = router;
