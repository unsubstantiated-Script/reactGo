import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";

const Movie = () => {
    const [movie, setMovie] = useState({});
    let {id} = useParams();

    useEffect(
        () => {
            let myMovie = {
                id: 5,
                title: "Pulp Fiction",
                release_date: 1994,
                runtime: 115,
                mpaa_rating: "R",
                description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
            }
            setMovie(myMovie);
        },
        [id]
    )

    return (
        <div>
            <h2> Movie: {movie.title}</h2>
            <small><em>{movie.release_date}, {movie.runtime} minutes, Rated: {movie.mpaa_rating}</em></small>
            <hr/>
            <p>{movie.description}</p>
        </div>
    )
}

export default Movie;