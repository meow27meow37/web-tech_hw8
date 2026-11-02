import { useState } from 'react'
import { type User } from '../types/user'
import { login, register } from '../api'

interface AuthPanelProps {
    onLogin: (user: User) => void;   // чем сообщить родителю, что вход состоялся
}

function AuthPanel({ onLogin }: AuthPanelProps) {
    const [режим, setРежим] = useState<"login" | "register">("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const вход = режим === "login";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);

        try {
            // Обе функции возвращают один и тот же объект пользователя,
            // поэтому дальше код одинаковый.
            const пользователь = вход
                ? await login(username, password)
                : await register(username, password);

            onLogin(пользователь);
        } catch (сбой) {
            setError(сбой instanceof Error ? сбой.message : "Не получилось");
        } finally {
            setSending(false);
        }
    };

    const сменитьРежим = (новый: "login" | "register") => {
        setРежим(новый);
        setError(null);          // чужая ошибка на новой вкладке только путает
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
                <div className="card card-body">
                    <ul className="nav nav-pills nav-fill mb-4">
                        <li className="nav-item">
                            <button
                                type="button"
                                className={"nav-link w-100 " + (вход ? "active" : "")}
                                onClick={() => сменитьРежим("login")}
                            >
                                Вход
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                type="button"
                                className={"nav-link w-100 " + (вход ? "" : "active")}
                                onClick={() => сменитьРежим("register")}
                            >
                                Регистрация
                            </button>
                        </li>
                    </ul>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="username">Логин</label>
                            <input
                                id="username"
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="password">Пароль</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={вход ? "current-password" : "new-password"}
                                required
                            />
                            {!вход && (
                                <div className="form-text">
                                    Не короче 6 символов — иначе сервер откажет.
                                </div>
                            )}
                        </div>

                        {/* pre-wrap: сервер иногда присылает несколько строк ошибок сразу */}
                        {error && (
                            <div className="alert alert-danger" style={{ whiteSpace: "pre-wrap" }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-100" disabled={sending}>
                            {sending ? "Отправляю..." : вход ? "Войти" : "Зарегистрироваться"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AuthPanel;
