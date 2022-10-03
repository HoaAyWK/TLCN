const Point = require('../models/Point');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.getPoints = catchAsyncErrors(async (req, res, next) => {
    const points = await Point.find({}, '-__v').lean();

    res.status(200).json({
        success: true,
        count: points.length,
        points
    });
});

exports.getPoint = catchAsyncErrors(async (req, res, next) => {
    const point = await Point.findById(req.params.id, '-__v').lean();

    if (!point) {
        return next(new ErrorHandler('Point not found', 404));
    }

    res.status(200).json({
        success: true,
        point
    });
});

exports.createPoint = catchAsyncErrors(async (req, res, next) => {
    const newPoint = new Point(req.body);
    const point = await newPoint.save();
    const { __v, ...ortherDetails } = point._doc;

    res.status(201).json({
        success: true,
        point: ortherDetails
    });
});

exports.deletePoint = catchAsyncErrors(async (req, res, next) => {
    const point = await Point.findById(req.params.id);

    if (!point) {
        return next(new ErrorHandler('Point not found', 404));
    }

    // TODO: check if there is any payment reference to


    await point.remove();
    
    res.status(200).json({
        success: true,
        message: `Deleted point with id: ${req.params.id}`
    });
});