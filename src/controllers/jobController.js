const cloudinary = require('cloudinary');
const mongoose = require('mongoose');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const Job = require('../models/Job');
const sendEmail = require('../services/sendEmail');

exports.getJobs = catchAsyncErrors(async (req, res, next) => {
    const jobs = await Job.find({ status: 'Open' })
        .select('-__v')
        .lean();

    res.status(200).json({
        success: true,
        count: jobs.length,
        jobs
    });
});


exports.getJobDetails = catchAsyncErrors(async (req, res, next) => {
    const job = await Job.findById(req.params.id).select('-__v').lean();

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));
    }

    res.status(200).json({
        success: true,
        job
    });
});

exports.createJob = catchAsyncErrors(async (req, res, next) => {
    const { title, description, file, closeTime, duration, minPrice, maxPrice, category } = req.body;

    if (!title) {
        return next(new ErrorHandler('Title is required', 400));
    }

    if (!description) {
        return next(new ErrorHandler('Description is required', 400));
    }

    if (!minPrice) {
        return next(new ErrorHandler('Min price is required', 400));
    }

    if (!maxPrice) {
        return next(new ErrorHandler('Max price is required', 400));
    }

    if (!category) {
        return next(new ErrorHandler('Category is required', 400));
    }

    if (minPrice < 0 || maxPrice < 0) {
        return next(new ErrorHandler('Min and max price must be positive', 400));
    }

    if (maxPrice <= minPrice) {
        return next(new ErrorHandler('Max price must be lagger than min price', 400));
    }

    const jobData = {
        title,
        description,
        closeTime,
        duration,
        category,
        price: {
            min: minPrice,
            max: maxPrice
        },
        owner: req.user._id
    };

    if (file) {
        const result = await cloudinary.v2.uploader.upload(file, {
            folder: 'jobs'
        });

        jobData.file = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const newJob = new Job(jobData);
    await newJob.save();

    const job = await Job.findById(newJob._id).select('-__v').lean();

    res.status(200).json({
        success: true,
        job
    });
});

exports.deleteMyJob = catchAsyncErrors(async (req, res, next) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));
    }

    const id = new mongoose.Types.ObjectId(req.user._id);

    if (id.toString() !== job.owner.toString()) {
        return next(new ErrorHandler(`You can not delete other employer's job`));
    }

    if (job.status !== 'Open') {
        return next(new ErrorHandler('Can not delete the job that already assign freelancer', 400));
    }

    // TODO: check if there is any request to perform this job

    await job.remove();

    res.status(200).json({
        success: true,
        message: `Deleted job with id: ${req.params.id}`
    });
});

exports.deleteEmloyerJob = catchAsyncErrors(async (req, res, next) => {
    const message = req.body.message;

    if (!message) {
        return next(new ErrorHandler('Please provide a reason to delete this job!', 400));
    }


    const job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));
    }

    if (job.status !== 'Open') {
        return next(new ErrorHandler('Can not delete the job that already assign freelancer', 400));
    }

    const employer = await User.findById(job.owner);

    if (!employer) {
        return next(new ErrorHandler(`Job's owner not found`, 404));
    }

    await job.remove();


    try {
        await sendEmail({
            email: employer.email,
            subject: 'Your Job in Flt has been deleted by admin',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});