import styles from "./Aside.module.css";
import ListIcon from "../../img/ListIcon.svg";
import NewGoalIcon from "../../img/newgoal.svg";
import LinkTo from "./LinkTo.jsx";


function Aside() {
    return ( 
        <aside className={styles.aside}>
                <LinkTo text="Goals list" to="/list">
                    <img
                        className={styles.icon}
                        src={ListIcon}
                        alt="Goals List Icon"
                    />
                </LinkTo>
                <LinkTo text="Create goal" to="/create">
                    <img
                        className={styles.icon}
                        src={NewGoalIcon}
                        alt="Create Goal Icon"
                    />
                </LinkTo>
            </aside>
     );
}

export default Aside;