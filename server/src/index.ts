// import { prisma } from "./lib/prisma";
// import express from "express";

// const app = express();
// app.use(express.json());

// app.get("/users", async (__, res) => {
//     const users = await prisma.user.findMany({});
//     res.json(users);
//     console.log(users);
// }
// );

// app.put("/users", async (__, res) => {
//     const updatedUsers = await prisma.user.update({
//         where: { email: "pedro.silva@example.com" },
//         data: {
//             age: 35,
//             isMarried: true,
//         },
//     });
//     res.json(updatedUsers);
//     console.log(updatedUsers);
// }
// );

// app.delete("/users", async (__, res) => {
//     const deleteUsers = await prisma.user.delete({
//         where: { email: "pedro.silva@example.com" },
//     });
//     res.json(deleteUsers);
//     console.log(deleteUsers);
// }
// );

// app.listen(4000, () => {
//     console.log("Server is running On 4000");
// });


import express from 'express';
import cors from 'cors';
import movieRoutes from "./Routes/movieRoutes";
import authRoutes from "./Routes/authRoutes";

const app = express();
app.use(express.json());
app.use(cors())

app.use('/movies', movieRoutes);
app.use('/auth', authRoutes);

const port = 3000
const server = app.listen(port, () => {
    console.log("server running on 3000")
});