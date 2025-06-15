import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import Input from "./form/Input";
import {useEffect, useState} from "react";
import Select from "./form/Select";
import TextArea from "./form/TextArea";
import Checkbox from "./form/Checkbox";
import Swal from "sweetalert2";

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
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", `Bearer ${jwtToken}`);

            const requestOptions = {
                method: 'GET',
                headers: headers,
            }

            fetch(`/admin/movies/${id}`, requestOptions)
                .then((response) => {
                    if (response.status !== 200) {
                        setError("invalid response code: " + response.status);
                    }
                    return response.json();
                })
                .then((data) => {
                    // fix the release date
                    data.movie.release_date = new Date(data.movie.release_date).toISOString().split('T')[0];

                    const checks = []

                    data.genres.forEach(g => {
                        if (data.movie.genres_array.indexOf(g.id) !== -1) {
                            checks.push({
                                id: g.id,
                                checked: true,
                                genre: g.genre,
                            })
                        } else {
                            checks.push({
                                id: g.id,
                                checked: false,
                                genre: g.genre,
                            })
                        }
                    })
                    // Set state
                    setMovie({
                        ...data.movie,
                        genres: checks,
                    })
                })
                .catch(err => {
                    console.error("Error fetching movie data:", err);
                });
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
            i === index ? {...g, checked: !g.checked} : g
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
        let errors = [];
        let required = [
            {field: movie.title, name: "title"},
            {field: movie.release_date, name: "release_date"},
            {field: movie.runtime, name: "runtime"},
            {field: movie.description, name: "description"},
            {field: movie.mpaa_rating, name: "mpaa_rating"},
        ]

        required.forEach(function (obj) {
            if (obj.field === "") {
                errors.push(obj.name)
            }
        })

        if (movie.genres_array.length === 0) {
            Swal.fire({
                title: "Error",
                text: "Please select at least one genre.",
                icon: "error",
                confirmButtonText: "OK"
            })
            errors.push("genres")
        }

        setErrors(errors)

        if (errors.length > 0) {
            return false;
        }

        // Passed validation, proceed with submission
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${jwtToken}`);

        // assume we are adding a new movie
        let method = 'PUT';

        if (movie.id > 0) {
            // editing an existing movie
            method = 'PATCH';
        }

        const requestBody = movie;

        requestBody.release_date = new Date(movie.release_date)
        requestBody.runtime = parseInt(movie.runtime, 10);


        let requestOptions = {
            body: JSON.stringify(requestBody),
            method: method,
            headers: headers,
            credentials: 'include',
        }

        fetch(`/admin/movies/${movie.id}`, requestOptions)
            .then(response => response.json())
            .then((data) => {
                if (data.error) {
                    console.log(data.error)
                } else {
                    navigate("/manage-catalogue")
                }
            })
            .catch(err => {
                console.log(err)
            })


    }

    const confirmDelete = (e) => {
        e.preventDefault()
        Swal.fire({
            title: "Delete Movie?",
            text: "You cannot undo this action.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                let headers = new Headers();

                headers.append("Authorization", `Bearer ${jwtToken}`);

                const requestOptions = {
                    method: 'DELETE',
                    headers: headers,
                    credentials: 'include',
                }

                // Proceed with deletion
                fetch(`/admin/movies/${movie.id}`, requestOptions)
                    .then(response => response.json())
                    .then((data) => {
                        if (data.error) {
                            console.log(data.error)
                        } else {
                            navigate("/manage-catalogue")
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        });

    }

    if (error) {
        return (
            <div className="container mb-5">
                <h2>Error</h2>
                <p className="text-danger">{error.message}</p>
            </div>
        );
    } else {
        return (
            <div className="container mb-5">
                <h2> Add/Edit Movie </h2>
                <hr/>
                {/*<pre>{JSON.stringify(movie, null, 3)}</pre>*/}
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
                        value={movie.mpaa_rating}
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
                    <hr/>
                    <button className="btn btn-lg btn-primary">Save Movie</button>

                    {movie.id > 0 &&
                        <a href="#!" className="btn btn-lg btn-danger ms-2" onClick={confirmDelete}>Delete Movie</a>}
                </form>
            </div>)
    }

}

export default EditMovie;