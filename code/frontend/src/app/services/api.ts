// Central API service — all calls to the backend go through here.
// Backend runs at localhost:8000 (Docker).

const BASE_URL = 'http://localhost:8000';

// Helper: get stored JWT token
function getToken(): string | null {
    return localStorage.getItem('syncro_token');
}

// Helper: build headers with optional auth
function headers(auth = false): HeadersInit {
    const h: HeadersInit = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return h;
}

// Helper: handle response errors
async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    return res.json();
}

// ---------- Types ----------
export interface AuthResponse {
    access_token: string;
    token_type: string;
    user_id: number;
    role: string;
    first_name: string;
}

export interface Profile {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    cover_image?: string;
}

export interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    delivery_time?: string;
    seller_id: number;
    category_id: number;
    image_url?: string;
}

export interface Order {
    id: number;
    service_name: string;
    amount: number;
    status: string;
    has_review: boolean;
    created_at: string;
    buyer_id: number;
    seller_id: number;
    listing_id?: number;
}

// ---------- Auth ----------
export const authApi = {
    async register(data: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
    }): Promise<AuthResponse> {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data),
        });
        return handleResponse<AuthResponse>(res);
    },

    async login(data: { email: string; password: string }): Promise<AuthResponse> {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data),
        });
        return handleResponse<AuthResponse>(res);
    },

    async toggleRole(): Promise<AuthResponse & { active_role: string }> {
        const res = await fetch(`${BASE_URL}/auth/toggle-role`, {
            method: 'POST',
            headers: headers(true),
        });
        return handleResponse(res);
    },
};

// ---------- Listings ----------
export const listingsApi = {
    async getAll(): Promise<Listing[]> {
        const res = await fetch(`${BASE_URL}/listings`);
        return handleResponse<Listing[]>(res);
    },

    async create(data: FormData): Promise<{ message: string; listing: Listing }> {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/listings/create`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: data, // FormData — do NOT set Content-Type, browser sets it with boundary
        });
        return handleResponse(res);
    },
};

// ---------- Orders ----------
export const ordersApi = {
    async getForUser(userId: number): Promise<Order[]> {
        const res = await fetch(`${BASE_URL}/orders/user/${userId}`, {
            headers: headers(true),
        });
        return handleResponse<Order[]>(res);
    },

    async create(data: {
        service_name: string;
        amount: number;
        seller_id: number;
        listing_id?: number;
    }): Promise<Order> {
        const res = await fetch(`${BASE_URL}/orders/`, {
            method: 'POST',
            headers: headers(true),
            body: JSON.stringify(data),
        });
        return handleResponse<Order>(res);
    },

    async updateStatus(orderId: number, status: string): Promise<Order> {
        const res = await fetch(`${BASE_URL}/orders/${orderId}/status?status=${status}`, {
            method: 'PATCH',
            headers: headers(true),
        });
        return handleResponse<Order>(res);
    },
};

// ---------- Profiles ----------
export const profilesApi = {
    async get(userId: number): Promise<Profile> {
        const res = await fetch(`${BASE_URL}/profiles/${userId}`);
        return handleResponse<Profile>(res);
    },

    async update(data: Partial<Profile>): Promise<Profile> {
        const res = await fetch(`${BASE_URL}/profiles/me`, {
            method: 'PUT',
            headers: headers(true),
            body: JSON.stringify(data),
        });
        return handleResponse<Profile>(res);
    },

    async uploadImage(file: File): Promise<{ url: string }> {
        const token = getToken();
        const form = new FormData();
        form.append('image', file);
        const res = await fetch(`${BASE_URL}/profiles/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
        });
        return handleResponse(res);
    },
};
