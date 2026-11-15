import { mockRequestsGateway } from '@/services/mock/requests';
import { api } from '@/store/api';
import type { MatchResult } from '@/types/provider';
import type {
  AIClassification,
  NewRequestInput,
  ServiceCategory,
  ServiceRequest,
} from '@/types/request';
import { toResult } from './helpers';

export interface RequestsGateway {
  listCategories(): Promise<ServiceCategory[]>;
  listMyRequests(): Promise<ServiceRequest[]>;
  getRequest(id: string): Promise<ServiceRequest>;
  createRequest(input: NewRequestInput): Promise<ServiceRequest>;
  updateRequest(id: string, input: NewRequestInput): Promise<ServiceRequest>;
  getClassification(requestId: string): Promise<AIClassification>;
  getMatches(requestId: string): Promise<MatchResult>;
}

// TODO(backend): the API has no request, classification or matching endpoints yet,
// so this always uses the mock, even with EXPO_PUBLIC_USE_MOCK=false. When they
// exist, add an HTTP implementation here (DTOs and mappers go in mappers.ts) and
// pick it the way services/api/equipment.ts does.
const gateway: RequestsGateway = mockRequestsGateway;

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