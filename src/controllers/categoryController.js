const cloudinary = require('cloudinary');

const Category = require('../models/Category');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.getAllCategoriesWithChildren = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.find({ parent: undefined }, 
        '_id name children')
        .populate({ path: 'children', select: '_id name'})
        .lean();

    res.status(200).json({
        success: true,
        categories
    });
});

exports.getCategoryDetail = catchAsyncErrors(async (req, res, next) => {
    const category = await Category.findById(
            req.params.id, 
            '_id name description image parent')
        .populate('children', '_id name description image children')
        .lean();
    
    if (!category) {
        return next(new ErrorHandler('Category not found.', 404));
    }
    
    res.status(200).json({
        success: true,
        category
    });
});

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    const { name, description, image, parent } = req.body;

    if (!name) {
        return next(new ErrorHandler('Name is required.', 400));
    }

    let parentCategory = undefined;

    if (parent) {
        parentCategory = await Category.findById(parent);

        if (!parentCategory) {
            return next(new ErrorHandler('Parent category not found.', 404));
        }
    } 

    const categoryData = {
        name,
        description,
        parent
    };

    if (image) {
        const result = await cloudinary.v2.uploader.upload(image, {
            folder: 'categories'
        });

        categoryData.image = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    const newCategory = new Category(categoryData);
    const category = await newCategory.save();

    if (parentCategory) {
        parentCategory.children.push(newCategory._id);
        await parentCategory.save();
    }   

    const { __v, ...categoryDetails } = category._doc;

    res.status(201).json({
        success: true,
        category: categoryDetails
    });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    const { name, description, image, parent } = req.body;
    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorHandler('Category not found.', 404));
    }

    if (parent && category.children.length > 0) {
        return next(new ErrorHandler(`Cannot attach this category to another category because it already has children's category`, 400));
    }

    let parentCategory = undefined;

    if (parent) {
        parentCategory = await Category.findById(parent);

        if (!parentCategory) {
            return next(new ErrorHandler('Parent category not found.', 404));
        }
    }

    const categoryData = {
        name,
        description,
        parent
    };

    if (image) {

        if (category.image) {
            await cloudinary.v2.uploader.destroy(category.image.public_id);
        }

        const result = await cloudinary.v2.uploader.upload(image, {
            folder: 'categories'
        });

        categoryData.image = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
            id,
            categoryData,
            {
                new: true,
                runValidators: true
            }
        )
        .select('_id name description image parent children')
        .lean();
    
    if (parentCategory) {
        parentCategory.children.push(updatedCategory._id);
        await parentCategory.save({ validateBeforeSave: false });
    }
    
    res.status(200).json({
        success: true,
        category: updatedCategory
    });
});

exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id
    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorHandler('Category not found.', 404));
    }

    if (category.children.length > 0) {
        return next(new ErrorHandler(`Please delete all this children's category first!`, 400));
    }

    // TODO: check if this category already has jobs in it
    //

    if (category.parent) {
        const parentCategory = await Category.findById(category.parent);

        if (!parentCategory) {
            return next(new ErrorHandler('Parent category not found.', 404));
        }

        parentCategory.children.filter(item => item !== id);
        await parentCategory.save();
    }

    await category.remove();

    res.status(200).json({
        success: true,
        message: `Deleted category with Id: ${id}`
    });
});