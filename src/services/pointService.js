const { Point } = require('../models');

const getAllPoints = async () => {
    return Point.find();
};

const getPoint = async (id) => {
    return Point.findById(id);
};

const create = async (pointBody) => {
    return Point.create(pointBody);
};

const updatePoint = async (id, updateBody) => {
    const point = await Point.findById(id);

    if (!point) {
        throw new ApiError(404, 'Point not found');
    }

    const updatedPoint = await Point.findByIdAndUpdate(
        id,
        updateBody,
        { 
            new: true, 
            runValidators: true
        }
    );
    
    return updatedPoint;
};

const deletePoint = async (id) => {
    const point = await Point.findById(id);

    if (!point) {
        throw new ApiError(404, 'Point not found');
    }

    // TODO: check if there is any payment reference to

    await point.remove();
};


module.exports = {
    getAllPoints,
    getPoint,
    create,
    updatePoint,
    deletePoint
};