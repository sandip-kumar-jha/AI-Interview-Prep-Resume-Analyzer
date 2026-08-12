const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

// ======================================================
// CREATE JWT TOKEN
// ======================================================

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

// ======================================================
// COOKIE OPTIONS
// ======================================================

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
};

// ======================================================
// REGISTER
// ======================================================

async function registerUserController(req, res) {
    try {
        console.log("REGISTER BODY:", req.body);

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password",
            });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail },
            ],
        });

        console.log(
            "EXISTING USER:",
            isUserAlreadyExists ? isUserAlreadyExists._id : null
        );

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message:
                    "Account already exists with this email address or username",
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
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

// ======================================================
// LOGIN
// ======================================================

async function loginUserController(req, res) {
    try {
        console.log("LOGIN BODY:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel.findOne({
            email: normalizedEmail,
        });

        console.log(
            "LOGIN USER FOUND:",
            user ? user._id : null
        );

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        console.log(
            "PASSWORD VALID:",
            isPasswordValid
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = createToken(user);

        res.cookie(
            "token",
            token,
            cookieOptions
        );

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

// ======================================================
// LOGOUT
// ======================================================

async function logoutUserController(req, res) {
    try {
        const token = req.cookies?.token;

        if (token) {
            try {
                await tokenBlacklistModel.create({
                    token,
                });
            } catch (blacklistError) {
                console.error(
                    "Blacklist Error:",
                    blacklistError
                );
            }
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
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

// ======================================================
// GET ME
// ======================================================

async function getMeController(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const user = await userModel.findById(
            req.user.id
        );

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
            message:
                "Something went wrong while fetching user",
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
};