import {Link, Outlet, useNavigate} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import Alert from "./components/Alert";

function App() {
    const [jwtToken, setJwtToken] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertClassName, setAlertClassName] = useState("d-none");

    // Ticking is used to prevent multiple fetch requests from being sent at the same time.
    const [tickInterval, setTickInterval] = useState();

    const navigate = useNavigate();

    const logOut = () => {
        const requestOptions = {
            method: 'GET', credentials: "include",
        }

        fetch(`/logout`, requestOptions)
            .catch((error) => {
                console.error("Logout error:", error);
            })
            .finally(() => {
                setJwtToken("")
                toggleRefresh(false)
            })

        navigate("/login");
    }

    const toggleRefresh = useCallback((status) => {
        if (status) {
            let i = setInterval(() => {

                const requestOptions = {
                    method: 'GET',
                    credentials: "include"
                }

                fetch(`/refresh`, requestOptions)
                    .then((response) => response.json())
                    .then(data => {
                        if (data.access_token) {
                            setJwtToken(data.access_token);
                        }
                    })
                    .catch(error => {
                        console.error("User not logged in");
                    })
            }, 600000) // 10 minutes

            setTickInterval(i)
        } else {
            setTickInterval(null)
            clearInterval(tickInterval)
        }
    }, [tickInterval])

    // Check if the user is logged in by checking the JWT token. Gets new token if the current one is empty.
    useEffect(() => {
        if (jwtToken === "") {
            const requestOptions = {
                method: 'GET',
                credentials: "include"
            }

            fetch(`/refresh`, requestOptions)
                .then((response) => response.json())
                .then(data => {
                    if (data.access_token) {
                        setJwtToken(data.access_token);
                        toggleRefresh(true)
                    }
                })
                .catch(error => {
                    console.error("User not logged in:", error);
                })
        }
    }, [jwtToken, toggleRefresh])


    return (<div className="container">
        <div className="row">
            <div className="col">
                <h1 className="mt-3">Watch this!</h1>
            </div>
            <div className="col text-end">
                {jwtToken === "" ? (<Link to="/login"><span className="badge bg-success">Login</span></Link>) : (
                    <Link to="#" onClick={logOut}><span className="badge bg-danger">Logout</span></Link>)}
            </div>
            <hr className="mb-3"/>
        </div>
        <div className="row">
            <div className="col-md-2">
                <nav>
                    <div className="list-group">
                        <Link to="/" className="list-group-item list-group-item-action">Home</Link>
                        <Link to="/movies" className="list-group-item list-group-item-action">Movies</Link>
                        <Link to="/genres" className="list-group-item list-group-item-action">Genres</Link>
                        {jwtToken !== "" && (<>
                            <Link to="/admin/movie/0" className="list-group-item list-group-item-action">Add
                                Movie</Link>
                            <Link to="/manage-catalogue" className="list-group-item list-group-item-action">Manage
                                Catalogue</Link>
                            <Link to="/graphql" className="list-group-item list-group-item-action">GraphQL</Link>
                        </>)}
                    </div>
                </nav>
            </div>
            <div className="col-md-10">
                <Alert
                    message={alertMessage}
                    className={alertClassName}
                />
                <Outlet context={{
                    jwtToken, setJwtToken, setAlertClassName, setAlertMessage, toggleRefresh
                }}/>
            </div>
        </div>
    </div>);
}

export default App;
