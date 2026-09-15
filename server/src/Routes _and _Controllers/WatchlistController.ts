// import type { Request, Response } from "express";
// import { prisma } from "../lib/prisma";
// import type { User } from "../generated/prisma/client";

// declare global {
//     namespace Express {
//         interface Request {
//             user?: User;
//         }
//     }
// }


// const addToWatchlistRouter = async (req: Request, res: Response) => {

//     if (!req.user) {
//         return res.status(401).json({
//             error: "Not authenticated"
//         });
//     }

//     const { movieId, status, rating, notes } = req.body;
//     const movie = await prisma.movie.findUnique({
//         where: { id: movieId },
//     })

//     if (!movieId) {
//         return res.status(404).json({
//             error: "Movie not found"
//         })
//     }

//     const existingInWatchList = await prisma.watchlistItem.findUnique({
//         where: {
//             userId_movieId: {
//                 userId: req.user.id,
//                 movieId: movieId,
//             }
//         }
//     })

//     if (existingInWatchList) {
//         return res.status(400).json({
//             error: "Movie already in the watchlist"
//         })
//     }

//     const watchlistItem = await prisma.watchlistItem.create({
//         data: {
//             userId: req.user.id,
//             movieId,
//             status: status || "PLANNED",
//             rating,
//             notes
//         }
//     });

//     res.status(201).json({
//         status: "success",
//         data: {
//             watchlistItem
//         }
//     })
// }

// export { addToWatchlistRouter }