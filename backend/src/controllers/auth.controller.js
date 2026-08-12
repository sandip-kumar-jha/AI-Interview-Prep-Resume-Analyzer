const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * Create JWT token
 */
function createToken(user) {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
}

/**
 * Cookie options for local development
 */
const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
};

/**
 * @name registerUserController
 * @description Register a new user
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password",
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }],
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message:
                    "Account already exists with this email address or username",
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash,
        });

        const token = createToken(user);

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Register Error:", error);

        return res.status(500).json({
            message: "Something went wrong while registering user",
        });
    }
}

/**
 * @name loginUserController
 * @description Login user with email and password
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = createToken(user);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Something went wrong while logging in",
        });
    }
}

/**
 * @name logoutUserController
 * @description Logout user and blacklist current token
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await tokenBlacklistModel.create({
                token,
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(200).json({
            message: "User logged out successfully",
        });
    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            message: "Something went wrong while logging out",
        });
    }
}

/**
 * @name getMeController
 * @description Get current logged-in user details
 * @access Private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Get Me Error:", error);

        return res.status(500).json({
            message: "Something went wrong while fetching user",
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
};