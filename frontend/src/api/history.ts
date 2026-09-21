import { apiClient } from './client';
import { HistoryItem } from '../types';
import { getStoredHistory } from '../services/forensicsEngine';

export const historyApi = {
  getAnalysisHistory: async (params?: {
    search?: string;
    filter?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: HistoryItem[]; total: number }> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.filter) query.set('filter', params.filter);
      if (params?.sort) query.set('sort', params.sort);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const qs = query.toString();
      const endpoint = `/history${qs ? `?${qs}` : ''}`;
      const res = await apiClient<{ items: HistoryItem[]; records?: HistoryItem[]; total: number }>(endpoint, {
        method: 'GET',
      });
      if (res?.items || res?.records) {
        return {
          items: res.items || res.records || [],
          total: res.total || 0,
        };
      }
    } catch {
      // client-side fallback
    }

    let records = getStoredHistory();

    // Filter by search
    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.documentName.toLowerCase().includes(q) ||
          r.documentHash.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (params?.filter && params.filter !== 'ALL') {
      records = records.filter((r) => r.riskCategory === params.filter);
    }

    return {
      items: records,
      total: records.length,
    };
  },

  getHistory: async (params?: {
    search?: string;
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ records: HistoryItem[]; total: number }> => {
    const res = await historyApi.getAnalysisHistory({
      search: params?.search,
      filter: params?.category,
      sort: params?.sort,
      page: params?.page,
      limit: params?.limit,
    });
    return {
      records: res.items,
      total: res.total,
    };
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    try {
      await apiClient<void>(`/history/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // offline handled
    }

    const current = getStoredHistory();
    const updated = current.filter((r) => r.id !== id && r.analysisId !== id);
    localStorage.setItem('verifyx_history_records', JSON.stringify(updated));
  },

  deleteRecord: async (id: string): Promise<void> => {
    return historyApi.deleteHistoryItem(id);
  },
};

