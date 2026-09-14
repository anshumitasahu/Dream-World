import {prisma} from "../src/lib/prisma"

const userId = "cc9a01f9-11b7-468f-aa0e-b12311a64615";

const movies = [
    {
        title: "Inception",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        releaseYear: 2010,
        genres: ["Action", "Sci-Fi", "Adventure"],
        runTime: 148,
        posterUrl: "https://image.tmdb.org/t/p/original/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
        createdBy: userId,
    },
    {
        title: "Interstellar",
        overview: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        releaseYear: 2014,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        runTime: 169,
        posterUrl: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        createdBy: userId,
    },
    {
        title: "The Dark Knight",
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        releaseYear: 2008,
        genres: ["Action", "Crime", "Drama"],
        runTime: 152,
        posterUrl: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        createdBy: userId,
    },
    {
        title: "Parasite",
        overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        releaseYear: 2019,
        genres: ["Comedy", "Drama", "Thriller"],
        runTime: 132,
        posterUrl: "https://image.tmdb.org/t/p/original/7TsL9WDhglrN20l5B2nQ1994o8i.jpg",
        createdBy: userId,
    },
    {
        title: "Spirited Away",
        overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        releaseYear: 2001,
        genres: ["Animation", "Family", "Fantasy"],
        runTime: 125,
        posterUrl: "https://image.tmdb.org/t/p/original/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        createdBy: userId,
    },
    {
        title: "Whiplash",
        overview: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
        releaseYear: 2014,
        genres: ["Drama", "Music"],
        runTime: 106,
        posterUrl: "https://image.tmdb.org/t/p/original/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
        createdBy: userId,
    },
    {
        title: "The Matrix",
        overview: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cybernetic intelligence.",
        releaseYear: 1999,
        genres: ["Action", "Sci-Fi"],
        runTime: 136,
        posterUrl: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        createdBy: userId,
    },
    {
        title: "Gladiator",
        overview: "A former Roman general sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
        releaseYear: 2000,
        genres: ["Action", "Adventure", "Drama"],
        runTime: 155,
        posterUrl: "https://image.tmdb.org/t/p/original/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
        createdBy: userId,
    },
    {
        title: "Spider-Man: Into the Spider-Verse",
        overview: "Teenager Miles Morales becomes the Spider-Man of his universe, and must join with five similar counterparts from other dimensions to stop a threat for all realities.",
        releaseYear: 2018,
        genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
        runTime: 117,
        posterUrl: "https://image.tmdb.org/t/p/original/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        createdBy: userId,
    },
    {
        title: "The Lord of the Rings: The Fellowship of the Ring",
        overview: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
        releaseYear: 2001,
        genres: ["Adventure", "Fantasy", "Drama"],
        runTime: 178,
        posterUrl: "https://image.tmdb.org/t/p/original/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
        createdBy: userId,
    }
];

const main = async () => {
    console.log("seeding movies");

    for (const movie of movies) {
        await prisma.movie.create({
            data: movie,
        });
        console.log(`created movie: ${movie.title}`)
    }

    console.log("seeding completed");

}

main().catch((err) => {
    console.error(err);
    process.exit(1);
}).
finally(async () => {
    await prisma.$disconnect()
})