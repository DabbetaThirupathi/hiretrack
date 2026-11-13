const router = require("express").Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { ApiError, asyncHandler } = require("../middleware/error");
const { signToken } = require("../utils/token");

// Fields a student is allowed to set on their own profile.
const PROFILE_FIELDS = ["name", "rollNo", "branch", "cgpa", "backlogs", "graduationYear", "phone", "skills", "resumeUrl"];

function pick(source, fields) {
  return fields.reduce((acc, f) => {
    if (source[f] !== undefined) acc[f] = source[f];
    return acc;
  }, {});
}

// POST /api/auth/register  - student self-registration
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    const user = await User.create({ ...pick(req.body, PROFILE_FIELDS), email, password, role: "student" });
    res.status(201).json({ token: signToken(user), user });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) throw new ApiError(401, "Invalid email or password");
    res.json({ token: signToken(user), user });
  })
);

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json({ user: req.user }));

// PUT /api/auth/me  - update own profile
router.put(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const updates = pick(req.body, PROFILE_FIELDS);
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    Object.assign(req.user, updates);
    await req.user.save();
    res.json({ user: req.user });
  })
);

module.exports = router;
