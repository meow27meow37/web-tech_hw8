import { type User, type Specialization, type ProfileChanges } from './types/user'

const API = "https://inai-col2.fishrungames.com";

// Сервер отвечает об ошибках ДВУМЯ разными способами:
//   {"detail": "Неверный логин или пароль."}                     — 401 и 403
//   {"username": ["Пользователь с таким именем уже существует."]} — 400
// Если разбирать только первый, на экране вместо текста появится "undefined".
function errorText(data: unknown, status: number): string {
    if (data && typeof data === "object") {
        const объект = data as Record<string, unknown>;

        if (typeof объект.detail === "string") {
            return объект.detail;
        }

        const поля = Object.entries(объект)
            .filter(([, значение]) => Array.isArray(значение))
            .map(([поле, значение]) => поле + ": " + (значение as string[]).join(" "));

        if (поля.length > 0) {
            return поля.join("\n");
        }
    }
    return "Сервер ответил " + status;
}

// Одна общая обёртка над fetch, чтобы не повторять настройки в каждом запросе.
async function request<T>(путь: string, настройки: RequestInit = {}): Promise<T> {
    const ответ = await fetch(API + путь, {
        ...настройки,
        // САМАЯ ВАЖНАЯ СТРОКА ВО ВСЕЙ РАБОТЕ.
        // Сервер узнаёт нас по cookie sessionid, а браузер отправляет cookie на
        // чужой домен только с этой настройкой. Без неё любой запрос к профилю
        // вернёт 403 «Учетные данные не были предоставлены».
        credentials: "include",
        headers: настройки.body ? { "Content-Type": "application/json" } : undefined,
    });

    // Тело читаем текстом: у выхода оно короткое, а при сбое сервера там может
    // оказаться вообще не JSON — тогда JSON.parse не должен ронять страницу.
    const текст = await ответ.text();
    let данные: unknown = null;
    try {
        данные = текст ? JSON.parse(текст) : null;
    } catch {
        данные = null;
    }

    if (!ответ.ok) {
        throw new Error(errorText(данные, ответ.status));
    }
    return данные as T;
}

// Регистрация. Сервер сразу выдаёт cookie входа, поэтому отдельно входить не надо.
export function register(username: string, password: string) {
    return request<User>("/api/register/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export function login(username: string, password: string) {
    return request<User>("/api/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export function logout() {
    return request<{ detail: string }>("/api/logout/", { method: "POST" });
}

export function getProfile() {
    return request<User>("/api/profile/");
}

// PATCH, а не PUT: отправляем только изменённые поля, остальное сервер не трогает.
export function saveProfile(changes: ProfileChanges) {
    return request<User>("/api/profile/", {
        method: "PATCH",
        body: JSON.stringify(changes),
    });
}

// Справочник специализаций. Единственный адрес, который работает без входа.
export function getSpecializations() {
    return request<Specialization[]>("/api/specializations/");
}
