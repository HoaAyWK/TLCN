const sendToken = (user, token, statusCode, res) => {
    const options = {
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user,
    });
};

module.exports = sendToken;