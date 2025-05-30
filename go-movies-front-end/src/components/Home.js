import Ticket from './../images/movie_tickets.jpg'
import {Link} from "react-router-dom";

const Home = () => {
    // noinspection JSValidateTypes
    return (
        <>
            <div className="text-center">
                <h2> Find a movie to watch! </h2>
                <hr/>
                <Link to="/movies">
                    <img src={Ticket} alt="Movie Tickets" className="img-fluid mb-3"/>
                </Link>
            </div>
        </>
    )
}

export default Home;