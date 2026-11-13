/**
 * Decide whether a student is eligible for a placement drive.
 * Pure function (no database access) so it is easy to unit test.
 *
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
function checkEligibility(student, drive, now = new Date()) {
  const reasons = [];
  const rules = drive.eligibility || {};

  if (drive.status === "closed") reasons.push("Drive is closed");
  if (drive.deadline && new Date(drive.deadline) < now) reasons.push("Application deadline has passed");

  if (student.cgpa == null || !student.branch) {
    reasons.push("Complete your profile (branch and CGPA) to apply");
    return { eligible: false, reasons };
  }

  if (rules.minCgpa && student.cgpa < rules.minCgpa) {
    reasons.push(`Minimum CGPA is ${rules.minCgpa} (yours: ${student.cgpa})`);
  }
  if (Array.isArray(rules.branches) && rules.branches.length && !rules.branches.includes(student.branch)) {
    reasons.push(`Open only to ${rules.branches.join(", ")}`);
  }
  const backlogs = student.backlogs || 0;
  if (rules.maxBacklogs != null && backlogs > rules.maxBacklogs) {
    reasons.push(`Maximum ${rules.maxBacklogs} active backlog(s) allowed (yours: ${backlogs})`);
  }
  if (rules.graduationYear && student.graduationYear !== rules.graduationYear) {
    reasons.push(`Only for the ${rules.graduationYear} batch`);
  }

  return { eligible: reasons.length === 0, reasons };
}

module.exports = { checkEligibility };
