import { mockRequestsGateway } from '@/services/mock/requests';
import { env } from '@/config/env';
import { api } from '@/store/api';
import type { MatchResult } from '@/types/provider';
import type {
  AIClassification,
  NewRequestInput,
  ServiceCategory,
  ServiceRequest,
} from '@/types/request';
import { toResult } from './helpers';
import { http } from './client';

export interface RequestsGateway {
  listCategories(): Promise<ServiceCategory[]>;
  listMyRequests(): Promise<ServiceRequest[]>;
  getRequest(id: string): Promise<ServiceRequest>;
  createRequest(input: NewRequestInput): Promise<ServiceRequest>;
  updateRequest(id: string, input: NewRequestInput): Promise<ServiceRequest>;
  getClassification(requestId: string): Promise<AIClassification>;
  getMatches(requestId: string): Promise<MatchResult>;
}

const httpRequestsGateway: RequestsGateway = {
  listCategories: async () => (await http.get<ServiceCategory[]>('/requests/categories')).data,
  listMyRequests: async () => (await http.get<ServiceRequest[]>('/requests')).data,
  getRequest: async (id) => (await http.get<ServiceRequest>(`/requests/${id}`)).data,
  createRequest: async (input) => (await http.post<ServiceRequest>('/requests', input)).data,
  updateRequest: async (id, input) => (await http.patch<ServiceRequest>(`/requests/${id}`, input)).data,
  getClassification: async (requestId) =>
    (await http.get<AIClassification>(`/requests/${requestId}/classification`)).data,
  getMatches: async (requestId) => {
    const result = (await http.get<MatchResult>(`/requests/${requestId}/matches`)).data;
    const scale = (value: number) => Math.round(value * 1000) / 10;
    return {
      ...result,
      providers: result.providers.map((provider) => ({
        ...provider,
        score: {
          total: scale(provider.score.total),
          rating: scale(provider.score.rating),
          proximity: scale(provider.score.proximity),
          response: scale(provider.score.response),
          price: scale(provider.score.price),
          experience: scale(provider.score.experience),
        },
      })),
    };
  },
};

// Request creation remains on the mock until the request CRUD API is added;
// AI reads use the production backend whenever mock mode is disabled.
const gateway: RequestsGateway = env.useMock ? mockRequestsGateway : httpRequestsGateway;

export const requestsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<ServiceCategory[], void>({
      queryFn: () => toResult(() => gateway.listCategories()),
    }),

    getMyRequests: build.query<ServiceRequest[], void>({
      queryFn: () => toResult(() => gateway.listMyRequests()),
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: 'Request' as const, id })),
        { type: 'Request' as const, id: 'LIST' },
      ],
    }),

    getRequest: build.query<ServiceRequest, string>({
      queryFn: (id) => toResult(() => gateway.getRequest(id)),
      providesTags: (_result, _error, id) => [{ type: 'Request', id }],
    }),

    createRequest: build.mutation<ServiceRequest, NewRequestInput>({
      queryFn: (input) => toResult(() => gateway.createRequest(input)),
      invalidatesTags: [{ type: 'Request', id: 'LIST' }],
    }),

    // Invalidating the request id also refreshes its classification and matches.
    updateRequest: build.mutation<ServiceRequest, { id: string; input: NewRequestInput }>({
      queryFn: ({ id, input }) => toResult(() => gateway.updateRequest(id, input)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Request', id },
        { type: 'Request', id: 'LIST' },
      ],
    }),

    getClassification: build.query<AIClassification, string>({
      queryFn: (requestId) => toResult(() => gateway.getClassification(requestId)),
      providesTags: (_result, _error, requestId) => [{ type: 'Request', id: requestId }],
    }),

    getMatches: build.query<MatchResult, string>({
      queryFn: (requestId) => toResult(() => gateway.getMatches(requestId)),
      providesTags: (_result, _error, requestId) => [{ type: 'Request', id: requestId }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetMyRequestsQuery,
  useGetRequestQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useGetClassificationQuery,
  useGetMatchesQuery,
} = requestsApi;
