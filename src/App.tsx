import { useEffect, useState } from 'react'
import { type User, type Specialization } from './types/user'
import { getProfile, getSpecializations, logout } from './api'
import AuthPanel from './components/AuthPanel'
import ProfileCard from './components/ProfileCard'
import ProfileForm from './components/ProfileForm'

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [проверяем, setПроверяем] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Спрашиваем профиль сразу при открытии: вдруг cookie с прошлого раза ещё
        // жива — тогда показываем кабинет, а не форму входа. Ответ 403 здесь не
        // поломка, а обычное «ты не вошёл», поэтому ошибку не показываем.
        getProfile()
            .then((пользователь) => setUser(пользователь))
            .catch(() => setUser(null))
            .finally(() => setПроверяем(false));

        // Справочник специализаций — единственный адрес без входа,
        // поэтому грузим его сразу, не дожидаясь авторизации.
        getSpecializations()
            .then((список) => setSpecializations(список))
            .catch(() => setSpecializations([]));
    }, []);

    const handleLogout = async () => {
        setError(null);
        try {
            await logout();
        } catch (сбой) {
            setError(сбой instanceof Error ? сбой.message : "Не удалось выйти");
        }
        // Пользователя убираем в любом случае: если сервер ответил ошибкой,
        // значит сессии и так уже нет, и держать человека в кабинете незачем.
        setUser(null);
    };

    if (проверяем) {
        return (
            <div className="container py-5">
                <p>Проверяю, вошли ли вы...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Рок-группа «Полёт»</h1>
                {user && (
                    <div>
                        <span className="me-3">Вы вошли как <strong>{user.username}</strong></span>
                        <button className="btn btn-outline-secondary" onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {!user && (
                <>
                    <p className="text-muted text-center mb-4">
                        Войдите или зарегистрируйтесь, чтобы заполнить анкету музыканта.
                    </p>
                    <AuthPanel onLogin={(пользователь) => setUser(пользователь)} />
                </>
            )}

            {user && (
                <div className="row">
                    <div className="col-lg-6">
                        <ProfileCard user={user} />
                    </div>
                    <div className="col-lg-6">
                        <ProfileForm
                            user={user}
                            specializations={specializations}
                            onSaved={(обновлённый) => setUser(обновлённый)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default App;
