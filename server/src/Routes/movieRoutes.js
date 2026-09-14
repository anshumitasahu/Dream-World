import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router()

router.get("/", async (req, res) => {
    const movies = await prisma.movie.findMany({});
    return res.status(200).json({ 
        success: true,
        message: "movies fetched successfully",
        data: movies
    })
})

export default router;