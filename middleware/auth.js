// middleware/auth.js

const protect = (req, res, next) => {
    // TODO: Implement your token validation logic here.
    // 1. Get token from header (e.g., Authorization: Bearer TOKEN)
    // 2. Verify the token
    // 3. If valid, find the user and attach it to the request object.
    
    // For now, we'll mock a user.
    const mockUser = { id: 'user-123', role: 'buyer' };
    req.user = mockUser;
    
    if (req.user) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};


module.exports = { protect, admin };