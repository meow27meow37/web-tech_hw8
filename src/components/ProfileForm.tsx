import { useState } from 'react'
import { type User, type Specialization, type SpecializationCode } from '../types/user'
import { saveProfile } from '../api'

interface ProfileFormProps {
    user: User;
    specializations: Specialization[];
    onSaved: (user: User) => void;   // родитель обновит карточку свежими данными
}

function ProfileForm({ user, specializations, onSaved }: ProfileFormProps) {
    const [firstName, setFirstName] = useState(user.profile.first_name);
    const [specialization, setSpecialization] = useState<SpecializationCode>(user.profile.specialization);
    const [bio, setBio] = useState(user.profile.bio);
    const [fee, setFee] = useState(user.profile.fee);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        setSaved(false);

        try {
            const обновлённый = await saveProfile({
                first_name: firstName,
                specialization: specialization,
                bio: bio,
                // ЛОВУШКА: сервер принимает число с ТОЧКОЙ ("2500.50"), а на
                // запятой отвечает 400 «Требуется численное значение».
                // На русской раскладке запятую ставят не задумываясь, поэтому
                // меняем её сами, а не ругаемся на человека.
                fee: fee.replace(",", "."),
            });

            onSaved(обновлённый);
            setFee(обновлённый.profile.fee);   // сервер округлил до "2500.00" — показываем как у него
            setSaved(true);
        } catch (сбой) {
            setError(сбой instanceof Error ? сбой.message : "Не удалось сохранить");
        } finally {
            setSending(false);
        }
    };

    return (
        <form className="card card-body" onSubmit={handleSubmit}>
            <h2 className="h4 mb-3">Редактировать профиль</h2>

            <div className="mb-3">
                <label className="form-label" htmlFor="first_name">Имя</label>
                <input
                    id="first_name"
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="specialization">Специализация</label>
                <select
                    id="specialization"
                    className="form-select"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value as SpecializationCode)}
                >
                    {/* Варианты не вписаны руками, а взяты с сервера:
                        появится новый инструмент — список обновится сам. */}
                    {specializations.map((вариант) => (
                        <option key={вариант.value} value={вариант.value}>
                            {вариант.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="bio">О себе</label>
                <textarea
                    id="bio"
                    className="form-control"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="fee">Ставка за концерт, сом</label>
                {/* type="text", а не "number": поле приходит с сервера строкой
                    "2500.00", и number такое значение показывает криво. */}
                <input
                    id="fee"
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                />
            </div>

            {error && (
                <div className="alert alert-danger" style={{ whiteSpace: "pre-wrap" }}>
                    {error}
                </div>
            )}
            {saved && <div className="alert alert-success">Сохранено.</div>}

            <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "Сохраняю..." : "Сохранить"}
            </button>
        </form>
    )
}

export default ProfileForm;
