const cloudinary = require('cloudinary');

const ApiError = require('../utils/ApiError');
const { Job, User } = require('../models');
const jobStatus = require('../config/jobStatus');
const userService = require('./userService');
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
    const freelancer = await User.findById(freelancerId);

    if (!freelancer) {
        throw new ApiError(404, 'User not found');
    }

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    for (let offer of job.offers) {
        if (offer.freelancer.toString() === freelancerId) {
            throw new ApiError(400, 'You already sent an offer to this job');
        }
    }

    const pointsRequire = 0.3 * amount;

    if (freelancer.points < pointsRequire) {
        throw new ApiError(400, `To offer this job, you must have at least ${pointsRequire} points (30% offer you provide) in your account`);
    }
    
    job.offers.push({ freelancer: freelancerId, amount, message });
    await job.save();
};

const cancelOffer = async (jobId, freelancerId, offerId) => {    
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    const offer = job.offers.id(offerId);

    if (!offer) {
        throw new ApiError(400, 'You have not yet sent an offer for this job');
    }

    if (offer.freelancer.toString() !== freelancerId) {
        throw new ApiError(400, `You can not cancel another freelancer's offer`);
    }

    if (offer.isAccepted) {
        throw new ApiError(400, 'Your offer already accepted, can not cancel it');
    }

    await offer.remove();
    await job.save();
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

        if (job.owner.toString() !== userId) {
            throw new ApiError(400, 'You are not the owner of this job');
        }

        if (job.status !== 'Open') {
            throw new ApiError(400, 'This job already in progess');
        }

        const offer = job.offers.id(offerId);

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
        
        await job.save();
        await freelancer.save();
        await employer.save();
        await session.commitTransaction();    
        
        return job;
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.status, error.message);
    } finally {
        await session.endSession();
    }
};

const getMyOfferJobs = async (userId) => {
    return await Job.find({ 'offers.freelancer': userId }, '-assignment');
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

const finishAssignment = async (userId, jobId, offerId) => {
    const session = await startSession();
    session.startTransaction();

    try {
        const job = await Job.findById(jobId).session(session);

        if (!job) {
            throw new ApiError(404, 'Job not found');
        }

        const employer = await User.findById(userId).session(session);

        if (job.owner.toString() !== userId) {
            throw new ApiError(400, 'You are not the owner of this job');
        }

        const freelancer = await User.findById(job.assignment.freelancer).session(session);

        if (!freelancer) {
            throw new ApiError(404, 'Freelancer not found');
        }

        const offer = job.offers.id(offerId);

        if (!offer) {
            throw new ApiError(404, 'Offer not found');
        }

        if (!offer.isAccepted) {
            throw new ApiError(400, 'This offer is not accepted yet');
        }

        const pay = 0.7 * offer.amount;
        const employerRemainPoints = employer.points - pay;

        if (employerRemainPoints < 0) {
            throw new ApiError(400, `Your account does not have enough points, this job need ${pay} points to finish`);
        }

        freelancer.points = freelancer.points + job.assignment.fund + 0.65 * offer.amount;
        employer.points = employerRemainPoints;
        job.assignment.fund = 0;
        job.status = 'Closed';

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

const addComment = async (userId, jobId, commentBody) => {
    const { rating, content, partnerId } = commentBody;

    const author = await User.findById(userId).lean();

    if (!author) {
        throw new ApiError(401, 'You are not logged in');
    }

    const partner = await User.findById(partnerId);

    if (!partner) {
        throw new ApiError('Partner not found');
    }

    const job = await Job.findById(jobId).lean();

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    if (partner.roles.includes(roleValues.EMPLOYER)) {
        if (job.assignment.freelancer && job.assignment.freelancer.toString() !== userId) {
            throw new ApiError(400, 'You can not write comment for the employer with who you are not working');
        }
    } else {
        if (job.owner.toString() !== userId) {
            throw new ApiError(400, 'You are not the owner of this job');
        }

        if (job.assignment.freelancer && job.assignment.freelancer.toString() !== partnerId) {
            throw new ApiError(400, 'You can not write comment for the freelancer with who you are not working');
        }
    }

    const comment = {
        rating,
        content,
        job: jobId,
        jobName: job.name,
        user: userId,
        userName: author.name
    };

    const commentExist = await User.findOne({
            'comments.job': jobId,
            'comments.user': userId
        })
        .lean();
    
    if (commentExist) {
        partner.comments.forEach(cmt => {
            if (cmt.user.toString() === userId && cmt.job.toString() === jobId) {
                cmt.rating = rating;
                cmt.content = content;
            }
        })
    } else {
        partner.comments.push(comment);
    }

    partner.ratings = partner.comments.reduce((acc, item) => item.rating + acc, 0) / partner.comments.length;

    await partner.save();
    
    return partner.comments;
};

const deleteComment = async (userId, partnerId, commentId) => {
    const author = await User.findById(userId).lean();

    if (!author) {
        throw new ApiError(401, 'You are not logged in');
    }

    const partner = await User.findById(partnerId);

    if (!partner) {
        throw new ApiError(404, 'Partner not found');
    }

    const comment = partner.comments.id(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (comment.user.toString() !== userId) {
        throw new ApiError(400, 'You are not the owner of this comment');
    }

    await comment.remove();

    const numOfComments = partner.comments.length;

    if (numOfComments > 0) {
        partner.ratings = partner.comments.reduce((acc, item) => item.rating + acc, 0) / numOfComments;
    } else {
        partner.ratings = 0;
    }

    await partner.save();

    return partner;
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
    finishAssignment,
    addComment,
    deleteComment
};