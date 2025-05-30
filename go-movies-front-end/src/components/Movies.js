import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const Movies = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        let moviesList = [
            {
                id: 1,
                title: "Inception",
                year: 2010,
                runtime: 115,
                mpaaRating: "PG-13",
                description: "A skilled thief is given a chance at redemption if he can successfully perform inception, planting an idea into someone's subconscious."
            },
            {
                id: 2,
                title: "The Matrix",
                year: 1999,
                runtime: 115,
                mpaaRating: "R",
                description: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers."
            },
            {
                id: 3,
                title: "Interstellar",
                year: 2014,
                runtime: 180,
                mpaaRating: "PG-13",
                description: "A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival."
            },
            {
                id: 4,
                title: "The Shawshank Redemption",
                year: 1994,
                runtime: 120,
                mpaaRating: "R",
                description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
            },
            {
                id: 5,
                title: "Pulp Fiction",
                year: 1994,
                runtime: 115,
                mpaaRating: "R",
                description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
            }
        ];

        setMovies(moviesList)
    }, []);

    return (
        <div>
            <h2> Movies </h2>
            <hr/>
            <table className="table table-striped table-hover">
                <thead>
                <tr>
                    <th>Movie</th>
                    <th>Released</th>
                    <th>Rating</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {movies.map((movie) => (
                    <tr key={movie.id}>
                        <td>
                            <Link to={`/movies/${movie.id}`}>
                                {movie.title}
                            </Link>
                        </td>
                        <td>{movie.year}</td>
                        <td>{movie.mpaaRating}</td>
                        <td>{movie.description}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default Movies;
