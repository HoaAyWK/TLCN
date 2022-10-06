const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { pointService } = require('../services');

const getPoints = catchAsyncErrors(async (req, res, next) => {
    const points = await pointService.getAllPoints();

    res.status(200).json({
        success: true,
        count: points.length,
        points
    });
});

const getPoint = catchAsyncErrors(async (req, res, next) => {
    const point = await pointService.getPoint(req.params.id);

    if (!point) {
        throw new ApiError(404, 'Point not found');
    }

    res.status(200).json({
        success: true,
        point
    });
});

const createPoint = catchAsyncErrors(async (req, res, next) => {
    const point = await pointService.create(req.body);

    res.status(201).json({
        success: true,
        point
    });
});

const deletePoint = catchAsyncErrors(async (req, res, next) => {
    await pointService.deletePoint(req.params.id);
    
    res.status(200).json({
        success: true,
        message: `Deleted point with id: ${req.params.id}`
    });
});

module.exports = {
    getPoints,
    getPoint,
    createPoint,
    deletePoint
};