import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Input from "./form/Input";

const GraphQL = () => {
    // setup stateful variables, if needed
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fullList, setFullList] = useState([]);



    // perform a search operation
    const performSearch = async () => {

    }

    const handleChange = (event) => {

    }

    // useEffect
    useEffect(() => {
        const payload = `{
              list {
                id
                title
                runtime
                release_date
                mpaa_rating
              }
            }`;

        const headers = new Headers();
        headers.append('Content-Type', 'application/graphql');

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: payload
        }

        fetch(`/graph`, requestOptions)
            .then(response => response.json())
            .then(response => {
               let theList = Object.values(response.data.list)
                setMovies(theList)
                setFullList(theList);
            })
            .catch(error => console.error('Error fetching movies:', error));

    },[])



    return (
        <div>
            <h2> GraphQL </h2>
            <hr/>
            <form onSubmit={handleChange}>
                <Input
                    title={"Search"}
                    type={"search"}
                    name={"search"}
                    className={"form-control"}
                    value={searchTerm}
                    onChange={handleChange}
                />
            </form>
            {movies ? (
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>Movie</th>
                        <th>Release Date</th>
                        <th>Rating</th>
                    </tr>
                    </thead>
                    <tbody>
                    {movies.map(movie => (
                        <tr key={movie.id}>
                            <td>
                                <Link to={`/movies/${movie.id}`}>
                                    {movie.title}
                                </Link>
                            </td>
                            <td>{new Date(movie.release_date).toLocaleDateString()}</td>
                            <td>{movie.mpaa_rating}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No movies found.</p>
            )}
        </div>
    )
}

export default GraphQL;