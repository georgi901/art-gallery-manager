(function () {
    const TOKEN_KEY = 'art-gallery-token';

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    }

    function clearToken() {
        sessionStorage.removeItem(TOKEN_KEY);
    }

    async function request(url, options = {}) {
        const headers = new Headers(options.headers || {});
        const token = getToken();

        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetch(url, { ...options, headers });
        let payload = {};
        try {
            payload = await response.json();
        } catch (error) {
            if (response.status !== 204) {
                throw new Error('Serverul a returnat un răspuns invalid.');
            }
        }

        if (!response.ok) {
            const error = new Error(payload.error?.message || 'Cererea nu a putut fi finalizată.');
            error.status = response.status;
            error.code = payload.error?.code;
            error.fields = payload.error?.fields || {};
            if (response.status === 401) {
                clearToken();
                window.dispatchEvent(new CustomEvent('auth:expired'));
            }
            throw error;
        }

        return payload;
    }

    async function login(credentials) {
        const payload = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        setToken(payload.data.token);
        return payload.data.user;
    }

    async function register(credentials) {
        const payload = await request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        return payload.data;
    }

    async function currentUser() {
        const payload = await request('/api/auth/me');
        return payload.data;
    }

    async function logout() {
        try {
            if (getToken()) await request('/api/auth/logout', { method: 'POST' });
        } finally {
            clearToken();
        }
    }

    window.galleryApi = {
        clearToken,
        currentUser,
        getToken,
        login,
        logout,
        register,
        request,
    };
})();
