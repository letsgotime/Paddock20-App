import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

type IHTTPMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest(
  method: IHTTPMethod, 
  url: string, 
  body?: any, 
  contentType: string = 'application/json'
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': contentType,
    },
    credentials: 'same-origin'
  };

  if (body && contentType === 'application/json') {
    options.body = JSON.stringify(body);
  } else if (body) {
    options.body = body;
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  
  return response;
}

// Helper to handle common query function patterns
type QueryFnOptions = {
  on401?: 'throwError' | 'redirect' | 'returnNull';
  parseJson?: boolean;
};

// Default query function for React Query
export function getQueryFn(options: QueryFnOptions = { on401: 'throwError', parseJson: true }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const endpoint = queryKey[0];
    const response = await fetch(endpoint);

    if (response.status === 401) {
      if (options.on401 === 'redirect') {
        window.location.href = '/auth';
        return null;
      } else if (options.on401 === 'returnNull') {
        return null;
      } else {
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    if (options.parseJson === false) {
      return response;
    }

    return response.json();
  };
}