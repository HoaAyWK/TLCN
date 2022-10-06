const mongoose = require('mongoose');

const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { jobService } = require('../services');
const pick = require('../utils/pick');
const sendEmail = require('../services/sendEmailService');

const getJobs = catchAsyncErrors(async (req, res, next) => {
    const filter = pick(req.query, ['name', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await jobService.getJobs(filter, options);

    res.status(200).json({
        success: true,
        ...result
    });
});


const getJobDetails = catchAsyncErrors(async (req, res, next) => {
    const job = await jobService.getJobDetails(req.params.id);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    res.status(200).json({
        success: true,
        job
    });
});

const createJob = catchAsyncErrors(async (req, res, next) => {
    const jobData = req.body;
    jobData.owner = req.user.id;

    const job = await jobService.createJob(jobData);

    res.status(201).json({
        success: true,
        job
    });
});

const deleteJob = catchAsyncErrors(async (req, res, next) => {
    await jobService.deleteJob(req.params.id, req.user.id);

    res.status(200).json({
        success: true,
        message: `Deleted job with id: ${req.params.id}`
    });
});

exports.offerJob = catchAsyncErrors(async (req, res, next) => {
    const { message, offer } = req.body;

    if (!message || !offer) {
        return next(new ErrorHandler('Message and offer are required', 400));
    }

    const job = await Job.findById(req.params.id).select('-__v');
    const user = await User.findById(req.user._id);

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));
    }

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const pointsRequire = offer * 0.3;

    if (user.points < pointsRequire) {
        return next(new ErrorHandler(`To offer this job, you must have at least ${pointsRequire} points (30% offer you provide) in your account`, 400));
    }

    job.requests.push({ freelancer: user, message, offer });
    user.offers.push(job._id);
    await job.save();
    await user.save();

    res.status(200).json({
        success: true,
        message: `Your offer has been sent to the job`
    });
});

exports.cancelOffer = catchAsyncErrors(async (req, res, next) => {
    const job = await Job.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));
    }

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    if (job.status !== 'Open' && user.offers.includes(job._id)) {
        return next(new ErrorHandler('Can not cancel this offer because it already in progess', 400));
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    job.requests = job.requests.filter(request => request.freelancer.toString() !== userId.toString());
    user.offers = user.offers.filter(item => item.toString() !== job._id.toString());

    await job.save();
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Cancelled the offer'
    });
});

exports.selectFreelancer = catchAsyncErrors(async (req, res, next) => {
    const { requestId } = req.body;

    // TODO: check if the current user is the owner's job

    if (!requestId) {
        return next(new ErrorHandler('Please select a job request!', 400));
    }

    const job = await Job.findById(req.params.id).select('-__v');

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));
    }

    if (job.status !== 'Open') {
        return next(new ErrorHandler('This job already in progess', 400));
    }

    const request = job.requests.id(requestId);

    if (!request) {
        return next(new ErrorHandler('Can not find any freelancer offer that matches the one you provide', 400));
    }

    const freelancer = await User.findById(request.freelancer);
    

    request.selected = true;
    job.status = 'Processing';
    job.assignment.freelancer = freelancer._id;
    job.assignment.status = 'Processing';
    const now = new Date(Date.now());
    job.assignment.deadline = now.setDate(now.getDate() + job.duration);

    await job.save();

    freelancer.jobTakens.push(job._id);
    await freelancer.save();

    const message = `Congratulations, your offer for '${job.title}' has been accepted by the customer`

    try {
        await sendEmail({
            email: freelancer.email,
            subject: 'Your offer has been accepted',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${freelancer.email}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

exports.getMyOfferJobs = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id)
        .populate('offers')
        .select('-__v')
        .lean();

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        jobs: user.offers
    });
});