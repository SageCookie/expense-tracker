import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    // 1. Create the JWT digital ID card
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // 2. Hide that ID card inside an HTTP-Only Cookie
    res.cookie('jwt', token, {
        httpOnly: true, // Prevents XSS attacks (client-side JS can't see it)
        secure: process.env.NODE_ENV !== 'development', // Uses HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
};

export default generateToken;