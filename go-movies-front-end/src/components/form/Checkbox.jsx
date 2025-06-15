const Checkbox = (props) => {

    return (
        <div className="form-check">
            <input
                type="checkbox"
                className="form-check-input"
                value={props.value}
                id={props.name}
                name={props.name}
                checked={props.checked}
                onChange={props.onChange}
            />
            <label className="form-check-label" htmlFor={props.name}>
                {props.title}
            </label>
        </div>
    );
}

export default Checkbox;