const cloudinary = require('cloudinary');
const mongoose = require('mongoose');

const ApiError = require('../utils/ApiError');
const { Job, User } = require('../models');
const jobStatus = require('../config/jobStatus');
const userService = require('./userService');
const sendEmailService = require('./sendEmailService');
const { roleValues } = require('../config/roles');

const getJobs = async (filter, options) => {
    return await Job.paginate(filter, options);
};

const getJob = async (id) => {
    return Job.findById(id, '-assignment');
};

const getJobDetails = async (id) => {
    return Job.findById(id);
};

const createJob = async (jobBody) => {
    const { name, description, file, closeTime, duration, minPrice, maxPrice, category, owner } = jobBody;

    if (maxPrice <= minPrice) {
        throw new ApiError(400, 'Max price must be lagger than min price');
    }

    const jobData = {
        name,
        description,
        closeTime,
        duration,
        category,
        minPrice,
        maxPrice,
        owner
    };


    // TODO: use another cloud storage to store the file
    if (file) {
        const result = await cloudinary.v2.uploader.upload(file, {
            folder: 'jobs'
        });

        jobData.file = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    return Job.create(jobData);
};

const deleteJob = async (id, userId) => {
    const job = await Job.findById(id);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    const user = await userService.getUserById(userId);

    if (job.owner !== userId) {
        if (!user.roles.includes(roleValues.ADMIN)) {
            throw new ApiError(403, `You can not delete another employer's job`);
        }
    }

    if (job.status !== jobStatus.OPEN) {
        throw new ApiError(403, 'Can not delete the job that already assign freelancer');
    }

    // TODO: check if there is any request to perform this job

    await job.remove();
};

const offerJob = async (jobId, offerBody) => {
    const { freelancerId, offer, message } = offerBody;
    const job = await Job.findById(jobId);


    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    const freelancer = await userService.getUserWithAllInfo(freelancerId);

    if (!freelancer) {
        throw new ApiError(404, 'User not found');
    }

    const pointsRequire = 0.3 * offer;

    if (freelancer.points < pointsRequire) {
        throw new ApiError(400, `To offer this job, you must have at least ${pointsRequire} points (30% offer you provide) in your account`);
    }

    // TODO: create a transaction

    job.requests.push({ freelancer: freelancerId, message, offer });
    freelancer.offers.push(jobId);

    await job.save();
    await freelancer.save();
};

const cancelOffer = async (jobId, freelancerId) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    const freelancer = await userService.getUserWithAllInfo(freelancerId);

    if (!freelancer) {
        throw new ApiError(404, 'User not found');
    }

    const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);
    const jobObjectId = new mongoose.Types.ObjectId(jobId);

    if (!freelancer.offers.includes(jobObjectId)) {
        throw new ApiError(400, 'You have not yet sent an offer for this job');
    }

    if (job.status !== 'Open' && user.offers.includes(jobId)) {
        return next(new ApiError(400, 'Can not cancel this offer because it already in progess'));
    }
    
    job.requests = job.requests.filter(request => request.freelancer.toString() !== freelancerObjectId.toString());
    freelancer.offers = freelancer.offers.filter(item => item.toString() !== jobObjectId.toString());

    await job.save();
    await freelancer.save();
};

const selectFreelancer = async (jobId, requestId) => {
    if (!requestId) {
        return next(new ApiError(400, 'Please select a job request!'));
    }

    const job = await Job.findById(jobId);

    if (!job) {
        return next(new ApiError(404, 'Job not found'));
    }

    if (job.status !== 'Open') {
        return next(new ApiError(400, 'This job already in progess'));
    }

    const request = job.requests.id(requestId);

    if (!request) {
        return next(new ApiError(400, 'Can not find any freelancer offer that matches the one you provide'));
    }

    const freelancer = await User.findById(request.freelancer);

    request.selected = true;
    job.status = 'Processing';
    job.assignment.freelancer = freelancer.id;
    job.assignment.status = 'Processing';

    const now = new Date(Date.now());

    job.assignment.deadline = now.setDate(now.getDate() + job.duration);

    await job.save();

    freelancer.jobTakens.push(jobId);
    await freelancer.save();

    const message = `Congratulations, your offer for '${job.title}' has been accepted by the customer`;

    try {
        await sendEmailService.sendEmail({
            email: freelancer.email,
            subject: 'Your offer has been accepted',
            message
        });

    } catch (error) {
        throw new ApiError(error.status, error.message);
    }
};

const getMyOfferJobs = async (userId) => {
    const user = await User.findById(userId)
        .populate('offers');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return user.offers;
};

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
};