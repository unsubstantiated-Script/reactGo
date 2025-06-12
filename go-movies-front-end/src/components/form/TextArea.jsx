const TextArea = (props) => {
    return (
        <div className="mb-3">
            <label htmlFor={props.name} className="form-label">{props.title}</label>
            <textarea
                className="form-control"
                id={props.name}
                name={props.name}
                onChange={props.onChange}
                value={props.value}
                rows={props.rows || 3}
            />
            <div className={props.errorDiv}>
                {props.errorMessage}
            </div>
        </div>
    )
}

export default TextArea;