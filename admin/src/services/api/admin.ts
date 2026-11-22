const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export interface ReviewItem { id: number; requestId?: number; text: string; suggestedCategory: string; confidence: number; status: string }

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('wedalink_admin_token');
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!response.ok) throw new Error((await response.json()).detail ?? 'Admin request failed');
  return response.json();
};

export const adminApi = {
  queue: () => request<ReviewItem[]>('/admin/ai/review-queue'),
  stats: () => request<{ pendingReviews: number; approvedReviews: number; rejectedReviews: number; pendingCategoryProposals: number }>('/admin/ai/stats'),
  decide: (id: number, decision: 'approve' | 'reject', category?: string) => request(`/admin/ai/review-queue/${id}/${decision}`, { method: 'POST', body: JSON.stringify({ category }) }),
};
