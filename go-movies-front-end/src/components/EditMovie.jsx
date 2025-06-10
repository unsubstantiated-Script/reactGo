import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import Input from "./form/Input";
import {useEffect, useState} from "react";
import Select from "./form/Select";
import TextArea from "./form/TextArea";

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
        id: "", title: "", release_date: "", runtime: "", mpaa_rating: "", description: "",
    })

    // get the ID from the URL
    let {id} = useParams();

    useEffect(() => {
        if (jwtToken === "") {
            navigate("/login");

        }

    }, [jwtToken, navigate]);

    const handleChange = () => (e) => {
        let value = e.target.value;
        let name = e.target.name;
        setMovie({
            ...movie,
            [name]: value
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



        </form>
    </div>)
}

export default EditMovie;