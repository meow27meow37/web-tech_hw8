import { type User } from '../types/user'

interface ProfileCardProps {
    user: User;
}

function ProfileCard({ user }: ProfileCardProps) {
    const профиль = user.profile;

    return (
        <div className="card card-body mb-4">
            <h2 className="h4 mb-3">Мой профиль</h2>

            <dl className="row mb-0">
                <dt className="col-sm-4">Логин</dt>
                <dd className="col-sm-8">{user.username}</dd>

                <dt className="col-sm-4">Имя</dt>
                <dd className="col-sm-8">{профиль.first_name || <span className="text-muted">не указано</span>}</dd>

                <dt className="col-sm-4">Специализация</dt>
                {/* Показываем specialization_display: это русская подпись,
                    которую сервер считает сам по коду специализации. */}
                <dd className="col-sm-8">{профиль.specialization_display}</dd>

                <dt className="col-sm-4">О себе</dt>
                <dd className="col-sm-8">{профиль.bio || <span className="text-muted">пусто</span>}</dd>

                <dt className="col-sm-4">Ставка за концерт</dt>
                <dd className="col-sm-8 mb-0">{профиль.fee} сом</dd>
            </dl>
        </div>
    )
}

export default ProfileCard;
