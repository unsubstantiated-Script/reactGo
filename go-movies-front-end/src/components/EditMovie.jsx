import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import Input from "./form/Input";
import {useEffect, useState} from "react";
import Select from "./form/Select";
import TextArea from "./form/TextArea";
import Checkbox from "./form/Checkbox";

const EditMovie = () => {
    const navigate = useNavigate()
    const {jwtToken} = useOutletContext()

    const [error, setError] = useState(null);
    const [errors, setErrors] = useState([]);

    const mpaaOptions = [
        {id: "NR", value: "NR"},
        {id: "G", value: "G"},
        {id: "PG", value: "PG"},
        {id: "PG-13", value: "PG-13"},
        {id: "R", value: "R"},
    ]

    const hasError = (key) => {
        return errors.indexOf(key) !== -1;
    }

    const [movie, setMovie] = useState({
        id: "",
        title: "",
        release_date: "",
        runtime: "",
        mpaa_rating: "",
        description: "",
        genres: [],
        genres_array: [Array(13).fill(false)]
    })

    // get the ID from the URL
    let {id} = useParams();
    if (id === undefined) {
        id = 0; // if no ID is provided, default to 0 (new movie)
    }

    useEffect(() => {
        if (jwtToken === "") {
            navigate("/login");
            return
        }

        if (id === 0) {
            // adding a movie
            // This will reset the movie state to default values
            setMovie({
                id: 0,
                title: "",
                release_date: "",
                runtime: "",
                mpaa_rating: "",
                description: "",
                genres: [],
                genres_array: Array(13).fill(false)
            });

            const headers = new Headers();
            headers.append("Content-Type", "application/json");

            const requestOptions = {
                method: 'GET',
                headers: headers,
            }

            fetch(`/genres`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    const checks = []

                    data.forEach(g => {
                        checks.push({
                            id: g.id,
                            checked: false,
                            genre: g.genre,
                        })
                    })

                    setMovie(m => ({
                        ...m,
                        genres: checks,
                        genres_array: []
                    }));
                })
                .catch(err => {
                    console.error("Error fetching genres:", err);
                });

        } else {
            // editing a movie
        }


    }, [id, jwtToken, navigate])


    const handleChange = () => (e) => {
        let value = e.target.value;
        let name = e.target.name;
        setMovie({
            ...movie,
            [name]: value
        });
    }

    const handleCheck = (e, index) => {
        // Clone genres array and update checked state
        const newGenres = movie.genres.map((g, i) =>
            i === index ? { ...g, checked: !g.checked } : g
        );

        // Clone genres_array and update IDs
        let newGenresArray = [...movie.genres_array];
        const genreId = parseInt(e.target.value, 10);
        if (!e.target.checked) {
            newGenresArray = newGenresArray.filter(id => id !== genreId);
        } else {
            newGenresArray.push(genreId);
        }

        setMovie({
            ...movie,
            genres: newGenres,
            genres_array: newGenresArray,
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    }

    return (<div>
        <h2> Add/Edit Movie </h2>
        <hr/>
        <pre>{JSON.stringify(movie, null, 3)}</pre>
        <form onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={movie.id} id="id"/>

            <Input
                title={"Title"}
                className={"form-control"}
                type={"text"}
                name={"title"}
                value={movie.title}
                onChange={handleChange("title")}
                errorDiv={hasError("title") ? "text-danger" : "d-none"}
                errorMessage={"Please enter a title."}
            />

            <Input
                title={"Release Date"}
                className={"form-control"}
                type={"date"}
                name={"release_date"}
                value={movie.release_date}
                onChange={handleChange("release_date")}
                errorDiv={hasError("release_date") ? "text-danger" : "d-none"}
                errorMessage={"Please enter a release date."}
            />

            <Input
                title={"Run Time"}
                className={"form-control"}
                type={"text"}
                name={"runtime"}
                value={movie.runtime}
                onChange={handleChange("runtime")}
                errorDiv={hasError("runtime") ? "text-danger" : "d-none"}
                errorMessage={"Please enter a run time."}
            />

            <Select
                title={"MPAA Rating"}
                name={"mpaa_rating"}
                onChange={handleChange("mpaa_rating")}
                options={mpaaOptions}
                placeholder={"Select MPAA Rating"}
                errorDiv={hasError("mpaa_rating") ? "text-danger" : "d-none"}
                errorMessage={"Please select an MPAA rating."}
            />

            <TextArea
                title={"Description"}
                name={"description"}
                value={movie.description}
                rows={3}
                onChange={handleChange("description")}
                errorDiv={hasError("description") ? "text-danger" : "d-none"}
                errorMessage={"Please enter a description."}
            />
            <hr/>
            <h3>Genres</h3>

            {movie.genres && movie.genres.length > 1 &&
                <>
                    {Array.from(movie.genres).map((g, index) =>
                        <Checkbox
                            key={index}
                            title={g.genre}
                            name={`genre`}
                            id={`genre-${index}`}
                            onChange={(e) => {
                                handleCheck(e, index)
                            }}
                            value={g.id}
                            checked={movie.genres[index].checked}
                        />
                    )}
                </>
            }


        </form>
    </div>)
}

export default EditMovie;