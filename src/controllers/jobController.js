const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { jobService, userService } = require('../services');
const pick = require('../utils/pick');
const { sendEmailService } = require('../services');

const getJobs = catchAsyncErrors(async (req, res, next) => {
    const filter = pick(req.query, ['name', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'exclude']);
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

const getJobWithOffers = catchAsyncErrors(async (req, res, next) => {
    const job = await jobService.getJobWithOffers(req.params.id);

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
    await jobService.cancelOffer(req.params.id, req.user.id, req.query.offer);

    res.status(200).json({
        success: true,
        message: 'Cancelled the offer'
    });
});

const selectFreelancer = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    const job = await jobService.selectFreelancer(req.user.id, jobId, req.body.offerId);
    const freelancer = await userService.getUserById(job.assignment.freelancer);

    // const message = `Congratulations, your offer for '${job.title}' has been accepted by the customer`;

    // try {
    //     await sendEmailService.sendEmail({
    //         email: freelancer.email,
    //         subject: 'Your offer has been accepted',
    //         message
    //     });

    //     res.status(200).json({
    //         success: true,
    //         message: `Email sent to: ${freelancer.email}`
    //     });  
    // } catch (error) {
    //     res.status(500).json({
    //         success: false,
    //         message: error.message
    //     });
    // } 

    res.status(200).json({
        succeess: true,
        message: 'Selected freelancer'
    })
});

const getMyOfferJobs = catchAsyncErrors(async (req, res, next) => {
    const offers = await jobService.getMyOfferJobs(req.user.id);

    res.status(200).json({
        success: true,
        offers
    });
});

const submitAssigment = catchAsyncErrors(async (req, res, next) => {
    const job = await jobService.submitAssigment(req.params.id, req.body.assignment);

    res.status(200).json({
        success: true,
        job
    });
});

const finishAssignment = catchAsyncErrors(async (req, res, next) => {
    await jobService.finishAssignment(req.user.id, req.params.id, req.query.offerId);

    res.status(200).json({
        success: true,
        message: 'Assignment completed'
    });
});

const addComment = catchAsyncErrors(async (req, res, next) => {
    const comments = await jobService.addComment(req.user.id, req.params.id, req.body);

    res.status(200).json({
        success: true,
        comments
    });
});

const deleteComment = catchAsyncErrors(async (req, res, next) => {
    const partner = await jobService.deleteComment(req.user.id, req.query.partner, req.params.id);

    res.status(200).json({
        success: true,
        partner
    });
});

module.exports = {
    getJobs,
    getJob,
    getJobDetails,
    getJobWithOffers,
    createJob,
    deleteJob,
    offerJob,
    cancelOffer,
    selectFreelancer,
    getMyOfferJobs,
    submitAssigment,
    finishAssignment,
    addComment,
    deleteComment
}