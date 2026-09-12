import { prisma } from "./lib/prisma";

console.log("Hello via Bun!");

async function getUser() {
    const users = await prisma.user.findMany({});
    console.log(users);  
}

getUser()
.then(() => {
    console.log("user found");
})
.catch(e => {
    console.log("error found while connecting to prisma", e)
})