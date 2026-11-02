// Коды специализаций, которые принимает сервер. Любое другое слово он отвергает
// с ошибкой «Значения ... нет среди допустимых вариантов».
export type SpecializationCode =
    | "vocals"
    | "guitar"
    | "bass"
    | "drums"
    | "keys"
    | "other";

// Справочник приходит с сервера: value уходит обратно, label показываем человеку.
export interface Specialization {
    value: SpecializationCode;
    label: string;
}

export interface Profile {
    first_name: string;
    specialization: SpecializationCode;
    specialization_display: string;   // сервер считает сам ("guitar" -> "Гитара"), менять нельзя
    bio: string;
    fee: string;                      // ВНИМАНИЕ: приходит строкой вида "2500.00"
}

export interface User {
    id: number;
    username: string;
    profile: Profile;
}

// Что разрешено менять в профиле. specialization_display сюда не входит.
export interface ProfileChanges {
    first_name: string;
    specialization: SpecializationCode;
    bio: string;
    fee: string;
}
