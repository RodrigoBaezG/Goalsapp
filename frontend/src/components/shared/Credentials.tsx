import type { ChangeEvent } from "react";
import styles from "./Credentials.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DemoCredentials {
    username: string;
    password: string;
}

interface CredentialsProps {
    send: (form: { username: string; password: string }) => Promise<void>;
    title: string;
    button: string;
    condition: string;
    conditionTitle: string;
    button2: string;
    url: string;
    error?: string | null;
    demoCredentials?: DemoCredentials;
}

const PREVIEW_GOALS = [
    { emoji: "📚", title: "Read 12 books", pct: 58 },
    { emoji: "🏋️", title: "Workout 4x per week", pct: 75 },
    { emoji: "💻", title: "Ship 3 side projects", pct: 33 },
];

function Credentials({ send, title, button, button2, conditionTitle, condition, url, error, demoCredentials }: CredentialsProps) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const isLogin = title === "Log in";

    const onChange = (e: ChangeEvent<HTMLInputElement>, prop: string) => {
        setForm((s) => ({ ...s, [prop]: e.target.value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await send(form);
        } finally {
            setLoading(false);
        }
    };

    const onDemo = async () => {
        if (!demoCredentials) return;
        setLoading(true);
        try {
            await send(demoCredentials);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* ── Left hero panel ── */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroMark}>🎯</div>

                    <h1 className={styles.heroTitle}>
                        Build habits,<br /><span>track progress.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A focused goal tracker that keeps you honest about what you're actually working towards.
                    </p>

                    <div className={styles.features}>
                        {[
                            "Set goals with custom frequency",
                            "Track progress with one click",
                            "Visual progress per goal",
                        ].map((f) => (
                            <div key={f} className={styles.feature}>
                                <span className={styles.featureIcon}>✓</span>
                                {f}
                            </div>
                        ))}
                    </div>

                    <div className={styles.previewCards}>
                        {PREVIEW_GOALS.map((g) => (
                            <div key={g.title} className={styles.previewCard}>
                                <div className={styles.previewEmoji}>{g.emoji}</div>
                                <div className={styles.previewMeta}>
                                    <div className={styles.previewTitle}>{g.title}</div>
                                    <div className={styles.previewBar}>
                                        <div className={styles.previewFill} style={{ width: `${g.pct}%` }} />
                                    </div>
                                </div>
                                <span className={styles.previewPct}>{g.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className={styles.formPanel}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2 className={styles.formTitle}>{isLogin ? "Welcome back" : "Create account"}</h2>
                        <p className={styles.formSubtitle}>
                            {isLogin
                                ? <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate(url); }}>Sign up</a></>
                                : <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate(url); }}>Log in</a></>
                            }
                        </p>
                    </div>

                    {demoCredentials && (
                        <div className={styles.demoBanner}>
                            <span style={{ fontSize: '20px' }}>👋</span>
                            <p className={styles.demoBannerText}>
                                <strong>Portfolio demo</strong> — log in instantly to explore the app.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorAlert} role="alert">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit}>
                        <div className={styles.fields}>
                            <label className="label">
                                Email
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.username}
                                    onChange={(e) => onChange(e, "username")}
                                    autoComplete="email"
                                    required
                                />
                            </label>
                            <label className="label">
                                Password
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => onChange(e, "password")}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                />
                            </label>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.actionsPrimary}>
                                <button
                                    type="submit"
                                    className="button button--black"
                                    disabled={loading}
                                >
                                    {loading ? "..." : button}
                                </button>
                            </div>

                            {demoCredentials && (
                                <>
                                    <div className={styles.divider}>or</div>
                                    <button
                                        type="button"
                                        className={`button button--demo ${styles["button--demo"]}`}
                                        onClick={onDemo}
                                        disabled={loading}
                                    >
                                        <span>⚡</span>
                                        Try Demo — no sign up needed
                                    </button>
                                </>
                            )}

                            {conditionTitle === condition && (
                                <p className={styles.switchLink}>
                                    New here?{" "}
                                    <button type="button" onClick={() => navigate(url)}>
                                        {button2}
                                    </button>
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Credentials;
