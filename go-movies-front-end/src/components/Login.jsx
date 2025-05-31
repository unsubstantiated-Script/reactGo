import {useState} from "react";
import Input from "./form/Input";
import {useNavigate, useOutletContext} from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {setJwtToken} = useOutletContext();
    const {setAlertMessage} = useOutletContext();
    const {setAlertClassName} = useOutletContext();

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("email/pass", email, password)

        if (email === "admin@test.com") {
            setJwtToken("abc")
            setAlertClassName('d-none')
            setAlertMessage("")
            navigate('/')
        } else {
            setAlertClassName('alert alert-danger')
            setAlertMessage("Invalid email or password")
        }

    }

    // noinspection JSValidateTypes
    return (
        <div className="col-md-6 offset-md-3">
            <h2> Login </h2>
            <hr/>

            <form onSubmit={handleSubmit}>
                <Input
                    title="Email Address"
                    type="email"
                    className="form-control"
                    name="email"
                    autoComplete="email-new"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    title="Password"
                    type="password"
                    className="form-control"
                    name="password"
                    autoComplete="password-new"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <hr/>
                <input
                    type="submit"
                    className="btn btn-primary"
                    value="Login"
                />
            </form>
        </div>
    )
}

export default Login;