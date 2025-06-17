import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const Genres = () => {


    const [genres, setGenres] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const requestOptions = {
            method: 'GET',
            headers: headers,
        };

        fetch('/genres', requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setError(data.message);
                } else {
                    setGenres(data);
                }
            })
            .catch(error => {
                setError(error.message);
                console.log(error);
            });

    }, []);

    if (error !== null) {

    } else {
        return (
            <div>
                <h2> Genres </h2>
                <hr/>
                <div className="list-group">
                    {genres.map((g) => (
                        <Link key={g.id}
                              to={`/genres/${g.id}`}
                              className="list-group-item list-group-item-action"
                              state={{genre: g.genre}}
                        >
                            {g.genre}
                        </Link>
                    ))}
                </div>
            </div>
        )
    }
}

export default Genres;
