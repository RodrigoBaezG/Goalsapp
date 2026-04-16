import LinkCss from "./Link.module.css";
import { Link } from "react-router-dom";

function LinkTo({ children, text, to }) {
    return (
        <Link to={to} className={LinkCss.element}>
            {children}
            {text && <span className={LinkCss.text}>{text}</span>}
        </Link>
    );
}

export default LinkTo;
