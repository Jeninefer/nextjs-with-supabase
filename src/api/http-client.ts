export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly url: string;
  readonly method: string;

  constructor({ status, statusText, body, url, method }: { status: number; statusText: string; body: unknown; url: string; method: string }) {
    super(`Request to ${method.toUpperCase()} ${url} failed with status ${status} (${statusText}).`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.url = url;
    this.method = method.toUpperCase();
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
}

export class JsonApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions) {
    if (!options.baseUrl) {
      throw new Error("ApiClient requires a baseUrl");
    }

    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.defaultHeaders = options.defaultHeaders;
    const fetchCandidate = options.fetchImpl ?? globalThis.fetch;
    if (!fetchCandidate) {
      throw new Error("A fetch implementation must be provided in this environment.");
    }
    this.fetchImpl = fetchCandidate.bind(globalThis);
  }

  async get<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
    return this.request<TResponse>("GET", path, init);
  }

  async post<TRequest, TResponse>(path: string, body: TRequest, init: RequestInit = {}): Promise<TResponse> {
    const headers = this.mergeHeaders(init.headers);
    if (!new Headers(headers).has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return this.request<TResponse>("POST", path, {
      ...init,
      body: body != null ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  private async request<TResponse>(method: string, path: string, init: RequestInit): Promise<TResponse> {
    const url = this.buildUrl(path);
    const headers = this.mergeHeaders(init.headers);

    const response = await this.fetchImpl(url, {
      ...init,
      method,
      headers,
    });

    const payload = await this.parseBody(response);
    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        body: payload,
        url,
        method,
      });
    }

    return payload as TResponse;
  }

  private buildUrl(path: string): string {
    if (!path) {
      return this.baseUrl;
    }

    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${this.baseUrl}/${normalizedPath}`;
  }

  private mergeHeaders(headers?: HeadersInit): Headers {
    const merged = new Headers(this.defaultHeaders);
    if (headers) {
      new Headers(headers).forEach((value, key) => merged.set(key, value));
    }
    return merged;
  }

  private async parseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
