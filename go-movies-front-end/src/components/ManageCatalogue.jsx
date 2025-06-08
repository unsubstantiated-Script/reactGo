import {useEffect, useState} from "react";
import {Link, useNavigate, useOutletContext} from "react-router-dom";

const ManageCatalogue = () => {

    const [movies, setMovies] = useState([]);
    const {jwtToken} = useOutletContext()
    const navigate = useNavigate();

    useEffect(() => {
        if (!jwtToken) {
            // If the user is not authenticated, redirect to the login page
            navigate("/login");
            return;
        }

        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + jwtToken);

        const requestOptions = {
            method: "GET",
            headers: headers,
        }

        fetch(`/admin/movies`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setMovies(data);

            })
            .catch((error) => {
                console.error("Error fetching movies:", error);
            });

    }, [jwtToken, navigate]);

    return (
        <div>
            <h2> Manage Catalogue </h2>
            <hr/>
            <table className="table table-striped table-hover">
                <thead>
                <tr>
                    <th>Movie</th>
                    <th>Released</th>
                    <th>Rating</th>
                </tr>
                </thead>
                <tbody>
                {movies.map((movie) => (

                    <tr key={movie.id}>
                        <td>
                            <Link to={`/admin/movies/${movie.id}`}>
                                {movie.title}
                            </Link>
                        </td>
                        <td>{movie.release_date}</td>
                        <td>{movie.mpaa_rating}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default ManageCatalogue;