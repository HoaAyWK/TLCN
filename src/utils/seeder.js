const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') })
const mongoose = require('mongoose');

const { User, Category, Job, Point } = require('../models');
const { connectDatabase } = require('../config/database');
const { userStatus } = require('../config/userStatus');
const { roleValues } = require('../config/roles');

connectDatabase();

const employerId = new mongoose.Types.ObjectId();
const freelancerId = new mongoose.Types.ObjectId();

const designCategoryId = new mongoose.Types.ObjectId();
const developmentCategoryId = new mongoose.Types.ObjectId();
const webDevelopmentCategoryId = new mongoose.Types.ObjectId();

const points = [
    {
        name: '100 Points',
        amount: 100
    },
    {
        name: '200 Points',
        amount: 200
    },
    {
        name: '500 Points',
        amount: 500
    }
];

const categories = [
    {
        _id: designCategoryId,
        name: 'Design'
    },
    {
        _id: developmentCategoryId,
        name: 'Development',
        children: [
            webDevelopmentCategoryId
        ]
    },
    {
        _id: webDevelopmentCategoryId,
        name: 'Web development',
        parent: developmentCategoryId
    }
];

const jobs = [
    {
        name: 'Demo job 1',
        description: 'Just a demo 1',
        minPrice: 100,
        maxPrice: 200,
        closeTime: 10,
        duration: 20,
        category: webDevelopmentCategoryId,
        owner: employerId,
    },
    {
        name: 'Demo job 2',
        description: 'Just a demo 2',
        minPrice: 300,
        maxPrice: 500,
        closeTime: 30,
        duration: 40,
        category: webDevelopmentCategoryId,
        owner: employerId,
    }
];

const seedPoints = async () => {
    try {
        await Point.deleteMany();
        console.log('Points are deleted');

        await Point.insertMany(points);
        console.log('Inserted points');
    } catch (error) {
        console.log(error.message);
    }
};

const seedUsers = async () => {
    try {
        await User.deleteMany();
        console.log('Users are deleted');

        const employer = {
            _id: employerId,
            name: 'employer',
            email: 'employer@gmail.com',
            password: '123456',
            phone: '01238139295',
            points: 100,
            emailConfirmed: true,
            status: userStatus.ACTIVE,
            roles: [
                roleValues.EMPLOYER,
                roleValues.FREELANCER
            ]
        };

        const freelancer = {
            _id: freelancerId,
            name: 'freelancer',
            email: 'freelancer@gmail.com',
            password: '123456',
            phone: '01238139295',
            points: 100,
            emailConfirmed: true,
            status: userStatus.ACTIVE
        };

        const admin = {
            name: 'admin',
            email: 'admin@gmail.com',
            password: '123456',
            phone: '0910301031849',
            roles: [
                roleValues.ADMIN
            ],
            emailConfirmed: true,
            status: userStatus.ACTIVE
        };

        await User.create(employer);
        await User.create(admin);
        await User.create(freelancer);
        console.log('Created 3 users');
    } catch (error) {
        console.log(error.message);
    }
};

const seedCategories = async () => {
    try {
        await Category.deleteMany();
        console.log('Categories are deleted');

        await Category.insertMany(categories);
        console.log('Inserted categories');
    } catch (error) {
        console.log(error.message);
    }
};

const seedJobs = async () => {
    try {
        await Job.deleteMany();
        console.log('Jobs are deleted');

        await Job.insertMany(jobs);
        console.log('Inserted jobs');
    } catch (error) {
        console.log(error.message);
    }
};


const seedData = async () => {
    try {
        await seedPoints();
        await seedUsers();
        await seedCategories();
        await seedJobs();

        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
};

seedData();