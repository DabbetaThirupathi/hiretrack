const test = require("node:test");
const assert = require("node:assert");
const { checkEligibility } = require("../src/utils/eligibility");

const future = new Date(Date.now() + 86400000);
const past = new Date(Date.now() - 86400000);

const baseDrive = {
  status: "open",
  deadline: future,
  eligibility: { minCgpa: 7, branches: ["CSE", "IT"], maxBacklogs: 0, graduationYear: 2026 },
};
const goodStudent = { cgpa: 8.2, branch: "IT", backlogs: 0, graduationYear: 2026 };

test("eligible student passes all rules", () => {
  const r = checkEligibility(goodStudent, baseDrive);
  assert.strictEqual(r.eligible, true);
  assert.deepStrictEqual(r.reasons, []);
});

test("low CGPA is rejected with a reason", () => {
  const r = checkEligibility({ ...goodStudent, cgpa: 6.5 }, baseDrive);
  assert.strictEqual(r.eligible, false);
  assert.match(r.reasons[0], /Minimum CGPA is 7/);
});

test("branch not allowed", () => {
  const r = checkEligibility({ ...goodStudent, branch: "MECH" }, baseDrive);
  assert.strictEqual(r.eligible, false);
  assert.match(r.reasons.join(), /Open only to CSE, IT/);
});

test("empty branch list means all branches allowed", () => {
  const drive = { ...baseDrive, eligibility: { ...baseDrive.eligibility, branches: [] } };
  assert.strictEqual(checkEligibility({ ...goodStudent, branch: "MECH" }, drive).eligible, true);
});

test("too many backlogs", () => {
  const r = checkEligibility({ ...goodStudent, backlogs: 2 }, baseDrive);
  assert.strictEqual(r.eligible, false);
});

test("wrong graduation batch", () => {
  const r = checkEligibility({ ...goodStudent, graduationYear: 2025 }, baseDrive);
  assert.strictEqual(r.eligible, false);
});

test("closed drive and passed deadline", () => {
  const r = checkEligibility(goodStudent, { ...baseDrive, status: "closed", deadline: past });
  assert.strictEqual(r.eligible, false);
  assert.strictEqual(r.reasons.length, 2);
});

test("incomplete profile", () => {
  const r = checkEligibility({ branch: "IT" }, baseDrive);
  assert.strictEqual(r.eligible, false);
  assert.match(r.reasons.join(), /Complete your profile/);
});

test("multiple failures are all reported", () => {
  const r = checkEligibility({ cgpa: 5, branch: "ECE", backlogs: 3, graduationYear: 2025 }, baseDrive);
  assert.strictEqual(r.reasons.length, 4);
});
