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

// ✅ Admin - Mark report reviewed and disable reported user
router.put("/:reportId/review", async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId).populate("reportedUser");

    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = "reviewed";
    await report.save();

    // 🚨 Disable reported user
    const reportedUser = report.reportedUser;
    if (reportedUser) {
      reportedUser.isDisabled = true;
      await reportedUser.save();
    }

    res.json({ 
      success: true, 
      message: `Report reviewed. User ${reportedUser?.username} has been disabled.` 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
