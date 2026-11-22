import { useMemo } from 'react';
import { api } from '@/store/api';
import { http } from './client';
import type { Quotation } from '@/types/quotation';

const quotationApi = api.injectEndpoints({
  endpoints: (build) => ({
    getQuotations: build.query<Quotation[], string>({ queryFn: async (requestId) => { try { return { data: (await http.get<Quotation[]>(`/quotations/request/${requestId}`)).data }; } catch (error) { return { error: error as never }; } }, providesTags: ['Quotation'] }),
    selectQuotation: build.mutation<Quotation, { requestId: string; quotationId: string }>({ queryFn: async ({ requestId, quotationId }) => { try { return { data: (await http.post<Quotation>(`/quotations/request/${requestId}/select/${quotationId}`)).data }; } catch (error) { return { error: error as never }; } }, invalidatesTags: ['Quotation', 'Request'] }),
  }),
});

export const { useGetQuotationsQuery, useSelectQuotationMutation } = quotationApi;
