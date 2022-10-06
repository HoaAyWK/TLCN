const cloudinary = require('cloudinary');

const ApiError = require('../utils/ApiError');
const Job = require('../models');
const jobStatus = require('../config/jobStatus');
const userService = require('./userService');
const { roleValues } = require('../config/roles');

const getJobs = async (filter, options) => {
    return await Job.pagiante(filter, options);
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

module.exports = {
    getJobs,
    getJob,
    getJobDetails,
    createJob,
    deleteJob
};