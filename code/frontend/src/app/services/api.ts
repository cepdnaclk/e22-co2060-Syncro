// Central API service — all calls to the backend go through here.
// In development: defaults to localhost:8000
// In production: set VITE_API_URL to your Azure backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    is_active?: boolean;
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
    buyer_name?: string;
    seller_name?: string;
    listing_id?: number;
}

// ---------- Auth ----------
export const authApi = {
    async register(data: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        location: string;
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

    async deleteAccount(): Promise<{ message: string }> {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            method: 'DELETE',
            headers: headers(true),
        });
        return handleResponse(res);
    },

    async getMe(): Promise<{ id: number; email: string; first_name: string | null; last_name: string | null; location: string | null; active_role: string }> {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: headers(true),
        });
        return handleResponse(res);
    },

    async updateMe(data: { first_name?: string; last_name?: string; location?: string }): Promise<{ id: number; email: string; first_name: string | null; last_name: string | null; location: string | null; active_role: string }> {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            method: 'PATCH',
            headers: headers(true),
            body: JSON.stringify(data),
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

    async setActiveStatus(isActive: boolean): Promise<Profile> {
        const res = await fetch(`${BASE_URL}/profiles/me/active`, {
            method: 'PATCH',
            headers: headers(true),
            body: JSON.stringify({ is_active: isActive }),
        });
        return handleResponse<Profile>(res);
    },
};

// ---------- Seller Summary (for New Message picker) ----------
export interface SellerSummary {
    user_id: number;
    name: string;
    description?: string;
    logo?: string;
    display_name: string;
}

// ---------- Notifications ----------
export interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    type?: string;
    reference_id?: number;
    created_at: string;
}

export const notificationsApi = {
    async getAll(): Promise<Notification[]> {
        const res = await fetch(`${BASE_URL}/notifications`, {
            headers: headers(true),
        });
        return handleResponse<Notification[]>(res);
    },

    async markRead(id: number): Promise<Notification> {
        const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: headers(true),
        });
        return handleResponse<Notification>(res);
    },
};

// ---------- Bids ----------
export interface BidRequest {
    id: number;
    user_id: number;
    category_id: number;
    description: string;
    status: string;
    created_at: string;
}

export interface Bid {
    id: number;
    bid_request_id: number;
    seller_id: number;
    seller_name?: string;
    seller_logo?: string;
    price: number;
    quantity: number;
    delivery_time?: string;
    message?: string;
    status: string;
    created_at: string;
}

export const bidsApi = {
    async getRequestById(requestId: number): Promise<BidRequest> {
        const res = await fetch(`${BASE_URL}/bids/requests/${requestId}`, {
            headers: headers(true),
        });
        return handleResponse<BidRequest>(res);
    },

    async getMyRequests(): Promise<BidRequest[]> {
        const res = await fetch(`${BASE_URL}/bids/requests`, {
            headers: headers(true),
        });
        return handleResponse<BidRequest[]>(res);
    },

    async getMatchingRequests(): Promise<BidRequest[]> {
        const res = await fetch(`${BASE_URL}/bids/requests/matches`, {
            headers: headers(true),
        });
        return handleResponse<BidRequest[]>(res);
    },

    async getBidsForRequest(requestId: number): Promise<Bid[]> {
        const res = await fetch(`${BASE_URL}/bids/request/${requestId}`, {
            headers: headers(true),
        });
        return handleResponse<Bid[]>(res);
    },

    async getMyBids(): Promise<Bid[]> {
        const res = await fetch(`${BASE_URL}/bids/my-bids`, {
            headers: headers(true),
        });
        return handleResponse<Bid[]>(res);
    },

    async submitBid(data: {
        bid_request_id: number;
        price: number;
        quantity: number;
        delivery_time?: string;
        message?: string;
    }): Promise<Bid> {
        const res = await fetch(`${BASE_URL}/bids/`, {
            method: 'POST',
            headers: headers(true),
            body: JSON.stringify(data),
        });
        return handleResponse<Bid>(res);
    },

    async acceptBid(bidId: number): Promise<Bid> {
        const res = await fetch(`${BASE_URL}/bids/${bidId}/accept`, {
            method: 'PATCH',
            headers: headers(true),
        });
        return handleResponse<Bid>(res);
    },

    async rejectBid(bidId: number): Promise<Bid> {
        const res = await fetch(`${BASE_URL}/bids/${bidId}/reject`, {
            method: 'PATCH',
            headers: headers(true),
        });
        return handleResponse<Bid>(res);
    },
};

// ---------- Reviews ----------
export interface Review {
    id: number;
    rating: number;
    comment?: string;
    order_id?: number | null;
    reviewer_id: number;
    reviewee_id: number;
    reviewer_name?: string;
    timestamp: string;
}

export const reviewsApi = {
    /** Submit a rating + comment for a completed order. */
    async create(orderId: number, data: { rating: number; comment?: string }): Promise<Review> {
        const res = await fetch(`${BASE_URL}/reviews/order/${orderId}`, {
            method: 'POST',
            headers: headers(true),
            body: JSON.stringify(data),
        });
        return handleResponse<Review>(res);
    },

    /** Fetch all reviews received by a seller (by their user_id). */
    async getForUser(userId: number): Promise<Review[]> {
        const res = await fetch(`${BASE_URL}/reviews/user/${userId}`, {
            headers: headers(),
        });
        return handleResponse<Review[]>(res);
    },

    /** Compute average rating for a seller without loading full profile. */
    async getAvgRating(userId: number): Promise<{ avg: number; count: number }> {
        try {
            const reviews = await reviewsApi.getForUser(userId);
            const count = reviews.length;
            const avg = count
                ? reviews.reduce((s, r) => s + r.rating, 0) / count
                : 0;
            return { avg, count };
        } catch {
            return { avg: 0, count: 0 };
        }
    },
    /** Submit a rating + comment directly for a seller (no order required). */
    async createForSeller(sellerId: number, data: { rating: number; comment?: string }): Promise<Review> {
        const res = await fetch(`${BASE_URL}/reviews/seller/${sellerId}`, {
            method: 'POST',
            headers: headers(true),
            body: JSON.stringify(data),
        });
        return handleResponse<Review>(res);
    },
};

// ---------- Public Seller Profile ----------
export interface SellerPublicProfile {
    profile: Profile;
    listings: Listing[];
    reviews: Review[];
    avgRating: number;
    reviewCount: number;
}

export const sellerProfileApi = {
    /** Fetches profile, listings, and reviews for any seller by their user_id. */
    async getPublicProfile(userId: number): Promise<SellerPublicProfile> {
        const [profile, listings, reviews] = await Promise.all([
            fetch(`${BASE_URL}/profiles/${userId}`).then(r =>
                r.ok ? r.json() : Promise.reject(new Error('Profile not found'))),
            fetch(`${BASE_URL}/listings/seller/${userId}`).then(r =>
                r.ok ? r.json() : []),
            fetch(`${BASE_URL}/reviews/user/${userId}`).then(r =>
                r.ok ? r.json() : []),
        ]);
        const avgRating = reviews.length
            ? reviews.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0) / reviews.length
            : 0;
        return { profile, listings, reviews, avgRating, reviewCount: reviews.length };
    },
};

// ---------- Messages ----------
export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    order_id?: number | null;
    content: string;
    timestamp: string;
    is_read: boolean;
    sender_name?: string;
}

export interface ConversationSummary {
    other_user_id: number;
    other_user_name: string;
    other_user_initials: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

export const messagesApi = {
    async getConversations(): Promise<ConversationSummary[]> {
        const res = await fetch(`${BASE_URL}/messages/conversations`, {
            headers: headers(true),
        });
        return handleResponse<ConversationSummary[]>(res);
    },

    async getHistory(otherUserId: number): Promise<Message[]> {
        const res = await fetch(`${BASE_URL}/messages/${otherUserId}?t=${Date.now()}`, {
            headers: headers(true),
            cache: 'no-store',
        });
        return handleResponse<Message[]>(res);
    },

    async markRead(otherUserId: number): Promise<void> {
        await fetch(`${BASE_URL}/messages/${otherUserId}/read`, {
            method: 'PUT',
            headers: headers(true),
        });
    },

    /** Send a message via the reliable REST endpoint (server pushes socket event). */
    async send(receiverId: number, content: string): Promise<Message> {
        const res = await fetch(`${BASE_URL}/messages/`, {
            method: 'POST',
            headers: headers(true),
            body: JSON.stringify({ receiver_id: receiverId, content }),
        });
        return handleResponse<Message>(res);
    },
};

