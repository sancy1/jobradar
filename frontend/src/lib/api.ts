// frontend/src/lib/api.ts
// API Client for JobRadar Backend with Complete Next.js Engine Parity

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// ============================================================
// TOKEN STORAGE (SSR-Safe Configuration)
// ============================================================

const TOKEN_KEY = 'jobradar_access_token';
const USER_KEY = 'jobradar_user';

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const userStorage = {
  get: (): any | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  set: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },
};

// ============================================================
// API CLIENT IMPLEMENTATION
// ============================================================

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor: Inject security token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.get();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Secure 401 Session Interception
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite loop if the refresh endpoint itself throws 401
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;

          // Prevent multiple simultaneous token refreshes
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
              const refreshData = await this.refreshToken();
              if (refreshData?.access_token) {
                tokenStorage.set(refreshData.access_token);
                this.isRefreshing = false;
                
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${refreshData.access_token}`;
                }
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              this.isRefreshing = false;
              this.clearSessionAndRedirect();
              return Promise.reject(refreshError);
            }
          }
        } else if (error.response?.status === 401) {
          this.clearSessionAndRedirect();
        }

        return Promise.reject(error);
      }
    );
  }

  private clearSessionAndRedirect(): void {
    tokenStorage.remove();
    userStorage.remove();
    // Verify execution scope is strictly client-side to prevent Next.js server compilation failures
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/signin')) {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  // ============================================================
  // AUTH ENDPOINTS
  // ============================================================

  // Handle provider redirect natively
  loginWithProvider(provider: 'google' | 'github'): void {
    if (typeof window === 'undefined') return;
    window.location.href = `${API_BASE_URL}${API_VERSION}/auth/${provider}/login`;
  }

  // Exchange code for token (called after OAuth redirect)
  async handleOAuthCallback(provider: 'google' | 'github', code: string) {
    const response = await this.client.get(`/auth/${provider}/callback`, {
      params: { code },
    });
    return response.data;
  }

  // Get current user profile
  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Get user preferences
  async getUserPreferences() {
    const response = await this.client.get('/auth/me/preferences');
    return response.data;
  }

  // Refresh token
  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch {
      // Gracefully bypass error trace logs on termination
    } finally {
      tokenStorage.remove();
      userStorage.remove();
    }
  }

  // ============================================================
  // JOBS ENDPOINTS
  // ============================================================

  async getJobs(params: {
    page?: number;
    page_size?: number;
    status?: string;
    location?: string;
    company?: string;
    keyword?: string;
    sort_by?: string;
    sort_order?: string;
  }) {
    const response = await this.client.get('/jobs', { params });
    return response.data;
  }

  async getJob(jobId: string, slug: string) {
    const response = await this.client.get(`/jobs/${jobId}/${slug}`);
    return response.data;
  }

  async saveJob(jobId: string) {
    const response = await this.client.post(`/jobs/${jobId}/save`);
    return response.data;
  }

  async skipJob(jobId: string) {
    const response = await this.client.post(`/jobs/${jobId}/skip`);
    return response.data;
  }

  // ============================================================
  // SEARCH ENDPOINTS
  // ============================================================

  async processUrls(urls: string[]) {
    const response = await this.client.post('/search/urls', { urls });
    return response.data;
  }

  async saveSearchConfig(name: string, config: any) {
    const response = await this.client.post('/search/save', { name, config });
    return response.data;
  }

  async getSearchHistory() {
    const response = await this.client.get('/search/history');
    return response.data;
  }

  // ============================================================
  // SCRAPE ENDPOINTS
  // ============================================================

  async startScrape(config: any) {
    const response = await this.client.post('/scrape/start', config);
    return response.data;
  }

  async getScrapeStatus(sessionId: string) {
    const response = await this.client.get('/scrape/status', {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async interruptScrape(sessionId: string, action: 'save' | 'delete') {
    const response = await this.client.post('/scrape/interrupt', {
      session_id: sessionId,
      action,
    });
    return response.data;
  }
}

// Singleton Engine Instantiation
export const api = new ApiClient();
export default api;
