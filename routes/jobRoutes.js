import express from "express";
import Job from "../schema/Job.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { companyName, jobTitle, description, salary, applyLink } = req.body;

    if (!companyName || !jobTitle || !description || !salary || !applyLink) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const salaryRegex = /^\$([0-9,]+(?: - [0-9,]+)?) per year$/;
    if (!salaryRegex.test(salary)) {
      return res.status(400).json({
        message: "Salary must be in the format '$70,000 - 100,000 per year'",
      });
    }

    const newJob = new Job({
      companyName,
      jobTitle,
      description,
      salary,
      applyLink,
    });

    await newJob.save();

    res.status(201).json({ message: "Job created successfully", job: newJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getAll", async (req, res) => {
  try {
    const jobs = await Job.find();

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs available" });
    }

    res.status(200).json({ jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export { router as jobRouter };
