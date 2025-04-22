import jwt from 'jsonwebtoken';
export const generateToken = (userId,res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'strict', // CSRF protection
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    return token;
}