const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { jobService } = require('../services');
const pick = require('../utils/pick');

const getJobs = catchAsyncErrors(async (req, res, next) => {
    const filter = pick(req.query, ['name', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await jobService.getJobs(filter, options);

    res.status(200).json({
        success: true,
        ...result
    });
});

const getJob = catchAsyncErrors(async (req, res, next) => {
    const job = await jobService.getJob(req.params.id);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    res.status(200).json({
        success: true,
        job
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

const offerJob = catchAsyncErrors(async (req, res, next) => {
    const offerData = req.body;
    offerData.freelancerId = req.user.id;

    await jobService.offerJob(req.params.id, offerData);

    res.status(200).json({
        success: true,
        message: `Your offer has been sent to the job`
    });
});

const cancelOffer = catchAsyncErrors(async (req, res, next) => {
    await jobService.cancelOffer(req.params.id, req.user.id);

    res.status(200).json({
        success: true,
        message: 'Cancelled the offer'
    });
});

const selectFreelancer = catchAsyncErrors(async (req, res, next) => {
    await jobService.selectFreelancer(req.params.id, req.body);

    res.status(200).json({
        success: true,
        message: `Email sent to: ${freelancer.email}`
    });    
});

const getMyOfferJobs = catchAsyncErrors(async (req, res, next) => {
    const offers = await jobService.getMyOfferJobs(req.user.id);

    res.status(200).json({
        success: true,
        jobs: offers
    });
});

module.exports = {
    getJobs,
    getJob,
    getJobDetails,
    createJob,
    deleteJob,
    offerJob,
    cancelOffer,
    selectFreelancer,
    getMyOfferJobs
}