import createClient from 'openapi-fetch';
import { BACKEND_URL } from '@/constants/app';
import type { paths } from '@/types/api-schema';

export const apiClient = createClient<paths>({ baseUrl: BACKEND_URL });
