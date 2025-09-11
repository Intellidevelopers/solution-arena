// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

// ✅ Create report
router.post("/", async (req, res) => {
  try {
    const { reporter, reportedUser, reason } = req.body;

    const report = new Report({ reporter, reportedUser, reason });
    await report.save();

    res.json({ success: true, message: "Report submitted", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Admin - Get all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "username email")
      .populate("reportedUser", "username email");

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Admin - Mark report reviewed & disable user
router.put("/:reportId/review", async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId).populate("reportedUser");
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Mark report as reviewed
    report.status = "reviewed";
    await report.save();

    // ✅ Disable the reported user's account
    const User = require("../models/User");
    await User.findByIdAndUpdate(report.reportedUser._id, { isDisabled: true });

    res.json({ success: true, message: "Report reviewed & user disabled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
