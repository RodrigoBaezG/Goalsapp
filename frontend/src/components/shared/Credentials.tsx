import type { ChangeEvent } from "react";
import styles from "./Credentials.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CredentialsProps {
    send: (form: { username: string; password: string }) => Promise<void>;
    title: string;
    button: string;
    condition: string;
    conditionTitle: string;
    button2: string;
    url: string;
    error?: string | null;
}

function Credentials({ send, title, button, button2, conditionTitle, condition, url, error }: CredentialsProps) {
    const [form, setForm] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const onChange = (event: ChangeEvent<HTMLInputElement>, prop: string) => {
        setForm((state) => ({ ...state, [prop]: (event.target as HTMLInputElement).value }));
    };

    const onAccess = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await send(form);
    };

    return (
        <div className={'card ' + styles.auth + ' mx-auto max-w-4xl'}>
            <h1 className={styles.head + " text-center"}>{title}</h1>

            {import.meta.env.DEV && (
                <div className="px-4 py-2 mx-4 mb-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
                    <p className="font-semibold mb-1">Demo access</p>
                    <p>User: example@gmail.com</p>
                    <p>Password: 12345678</p>
                </div>
            )}

            {error && (
                <div role="alert" className="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <form className="p-4">
                <label className="label">
                    Email
                    <input
                        className="input"
                        type="email"
                        placeholder="Type your email"
                        value={form.username}
                        onChange={(e) => onChange(e, "username")}
                    />
                </label>
                <label className="label">
                    Password
                    <input
                        className="input"
                        type="password"
                        placeholder="Type your password"
                        value={form.password}
                        onChange={(e) => onChange(e, "password")}
                    />
                </label>
            </form>

            <div className="flex justify-between items-center p-2 m-2 font-bold h-8 cursor-pointer">
                <button className="button button--black" onClick={onAccess}>
                    {button}
                </button>
                {conditionTitle === condition && (
                    <button className="button button--gray" onClick={() => navigate(url)}>
                        {button2}
                    </button>
                )}
            </div>
        </div>
    );
}

export default Credentials;
