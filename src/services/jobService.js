const cloudinary = require('cloudinary');
const mongoose = require('mongoose');

const ApiError = require('../utils/ApiError');
const { Job, User, Offer } = require('../models');
const jobStatus = require('../config/jobStatus');
const userService = require('./userService');
const sendEmailService = require('./sendEmailService');
const { startSession } = require('mongoose');
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

const getJobWithOffers = async (id) => {
    return Job.findById(id).populate({ path: 'offers' });
}

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
    const { freelancerId, amount, message } = offerBody;
    const freelancer = await User.findById(freelancerId).lean();

    if (!freelancer) {
        throw new ApiError(404, 'User not found');
    }

    const offerExist = await Offer.findOne({ freelancer: freelancerId, job: jobId }).lean();

    if (offerExist) {
        throw new ApiError(400, 'You already sent an offer to this job');
    }

    const pointsRequire = 0.3 * amount;

    if (freelancer.points < pointsRequire) {
        throw new ApiError(400, `To offer this job, you must have at least ${pointsRequire} points (30% offer you provide) in your account`);
    }

    const session = await startSession();
    session.startTransaction();

    try {
        const offer = await Offer.create([{ freelancer: freelancerId, job: jobId, amount, message }], { session });
        const job = await Job.findById(jobId).session(session);

        if (!job) {
            throw new ApiError(404, 'Job not found');
        }
        
        job.offers.push(offer[0]._id);
        await job.save();
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.status, error.message);
    } finally {
        await session.endSession();
    } 
};

const cancelOffer = async (jobId, freelancerId) => {
    const session = await startSession();
    session.startTransaction();

    try {
        const offer = await Offer.findOne({ freelancer: freelancerId, job: jobId }).session(session);
        
        if (!offer) {
            throw new ApiError(404, 'Offer not found');
        }
    
        if (offer.isAccepted) {
            throw new ApiError(400, 'Job is in progess');
        }
        
        const job = await Job.findById(jobId).session(session);

        if (!job) {
            throw new ApiError(404, 'Job not found');
        }

        const offerObjectId = new mongoose.Types.ObjectId(offer.id);
        job.offers.filter(offer => offer.toString() !== offerObjectId.toString());

        await job.save();
        await offer.remove();
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.status, error.mesaage);
    } finally {
        await session.endSession();
    }
};

const selectFreelancer = async (userId, jobId, offerId) => {
    if (!offerId) {
        throw new ApiError(400, 'Please select an offer!');
    }

    const session = await startSession();
    session.startTransaction();
    
    try {
        const job = await Job.findById(jobId).session(session);

        if (!job) {
            throw new ApiError(404, 'Job not found');
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        if (job.owner.toString() !== userObjectId.toString()) {
            throw new ApiError(400, 'You are not the owner of this job');
        }

        if (job.status !== 'Open') {
            throw new ApiError(400, 'This job already in progess');
        }

        const offer = await Offer.findById(offerId).session(session);

        if (!offer) {
            throw new ApiError(400, 'Can not find any freelancer offer that matches the one you provide');
        }

        const freelancer = await User.findById(offer.freelancer).session(session);

        if (!freelancer) {
            throw new ApiError(404, 'Freelancer not found');
        }

        const employer = await User.findById(job.owner).session(session);

        if (!employer) {
            throw new ApiError(404, 'Employer not found');
        }

        const amount = offer.amount * 0.3;

        if (employer.points < amount) {
            throw new ApiError(400, `To start the job, you must have at least ${amount} points (30% offer) in your account`);
        }
        
        freelancer.jobTakens.push(jobId);
        freelancer.points = freelancer.points - amount;
        employer.points = employer.points - amount;
        offer.isAccepted = true;

        const now = new Date(Date.now());

        job.status = 'Processing',
        job.assignment = {
            freelancer: offer.freelancer,
            deadline: now.setDate(now.getDate() + job.duration),
            fund: amount * 2
        }
        
        await offer.save();
        await job.save();
        await freelancer.save();
        await employer.save();

        await session.commitTransaction();    
        session.endSession();

        return job;
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw new ApiError(error.status, error.message);
    }
};

const getMyOfferJobs = async (userId) => {
    const offer = await Offer.find({ freelancer: userId }, '-freelancer -__v -_id')
        .populate({ path: 'job', select: '-assignment' });

    if (!offer) {
        throw new ApiError(404, 'Offer not found');
    }

    return offer;
};

const submitAssigment = async (jobId, assignmentUrl) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    job.assignment.files = assignmentUrl;
    await job.save();

    return job;
};

const finishAssignment = async (userId, jobId) => {
    const session = await startSession();
    session.startTransaction();

    try {
        const job = await Job.findById(jobId).session(session);

        if (!job) {
            throw new ApiError(404, 'Job not found');
        }

        const employer = await User.findById(userId).session(session);
        const employerObjectId = mongoose.Types.ObjectId(employer.id);

        if (job.owner.toString() !== employerObjectId.toString()) {
            throw new ApiError(400, 'You are not the owner of this job');
        }

        const offer = await Offer.findOne({ freelancer: job.assignment.freelancer, job: jobId }).lean();
        
        if (!offer) {
            throw new ApiError(404, 'Offer not found');
        }

        const freelancer = await User.findById(job.assignment.freelancer).session(session);

        if (!freelancer) {
            throw new ApiError(404, 'Freelancer not found');
        }

        job.status = 'Closed';
        job.assignment.fund = 0;
        
        freelancer.points = freelancer.points + 0.95 * offer.amount;
        employer.points = employer.points - 0.5 * offer.amount;

        await job.save();
        await freelancer.save();
        await employer.save();
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.status, error.message);
    } finally {
        await session.endSession();
    }
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
    getMyOfferJobs,
    getJobWithOffers,
    submitAssigment,
    finishAssignment
};