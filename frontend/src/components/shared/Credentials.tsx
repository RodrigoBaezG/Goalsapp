import type { ChangeEvent } from "react";
import styles from "./Credentials.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CredentialsProps {
    send: Function;
    title: string;
    button: string;
    condition: string;
    conditionTitle: string;
    button2: string;
    url: string;
}


function Credentials({ send, title, button, button2, conditionTitle, condition, url }: CredentialsProps) {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const { username, password } = form;
    const navigate = useNavigate();

    const onChange = (event: ChangeEvent, prop: string) => {
        const value = (event.target as HTMLInputElement).value;
        setForm((state) => ({ ...state, [prop]: value }));
    }

    const onAccess = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        send(form);
    };

    function onGo(url: string) {
         navigate(url);
    };

    return (
        <div className={'card ' + styles.auth + ' mx-auto max-w-4xl'}>
            <h1 className={styles.head + " text-center"}>{title}</h1>

            <div className="p-2 m-2">
                <h3>Demo Access</h3>
                <p>User: example@gmail.com</p>
                <p>Password: 12345</p>
            </div>
            <form className="p-4">
                <label className="label">User
                    <input
                        className="input"
                        placeholder="Type your email"
                        value={username}
                        onChange={(e) => onChange(e, "username")}
                    />
                </label>
                <label className="label">Password
                    <input
                        className="input"
                        placeholder="Type your password"
                        value={password}
                        onChange={(e) => onChange(e, "password")}
                    />
                </label>
            </form>
            <div className="flex justify-between items-center p-2 m-2 font-bold h-8 cursor-pointer">
                <button
                    className="button button--black"
                    onClick={(e) => onAccess(e)}>
                    {button}
                </button>
                {conditionTitle === condition && (
                    <>
                        <button
                            className="button button--gray"
                            onClick={(e) => onGo(url)}>
                            {button2}
                        </button>
                    </>)}
            </div>

        </div>
    );
}

export default Credentials;