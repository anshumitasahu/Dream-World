import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { generateToken } from "../lib/jwt/index"

const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    const userExists = await prisma.user.findUnique({
        where: { email: email },
    })

    if (userExists) {
        return res.status(400).json({
            error: "User already exists with this email"
        })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const tokens = generateToken(user.id, res);

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
            },
            tokens,
        },
    });
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("recived from client", email, password);

    const user = await prisma.user.findUnique({
        where: { email: email },
    });
    if (!user) {
        return res.status(401).json({
            error: "Invalid email"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            error: "Invalid password"
        })
    }

    const tokens = generateToken(user.id, res);

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: email,
            },
            tokens
        }
    })
};

const logout = async (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
};

export { register, login, logout };