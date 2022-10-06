const cloudinary = require('cloudinary');

const { categoryService } = require('../services');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const getAllCategoriesWithChildren = catchAsyncErrors(async (req, res, next) => {
    const categories = await categoryService
        .getAllCategoriesWithChildren();

    res.status(200).json({
        success: true,
        categories
    });
});

const getCategoryDetail = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService
        .getCategoryWithChildrenById(req.params.id);
    
    if (!category) {
        throw new Error();
    }

    res.status(200).json({
        success: true,
        category
    });
});

const createCategory = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService
        .create(req.body);

    res.status(201).json({
        success: true,
        category
    });
});

const updateCategory = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService
        .updateCategory(req.params.id, req.body);
    
    res.status(200).json({
        success: true,
        category
    });
});

const deleteCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    await categoryService.deleteCategory(id);

    res.status(200).json({
        success: true,
        message: `Deleted category with Id: ${id}`
    });
});

module.exports = {
    getAllCategoriesWithChildren,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory
};