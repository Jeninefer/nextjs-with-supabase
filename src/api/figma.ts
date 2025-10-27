import { JsonApiClient, type ApiClientOptions } from "@/api/http-client";

const DEFAULT_FIGMA_BASE_URL = process.env.FIGMA_API_URL ?? "https://api.figma.com/v1";

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  characters?: string;
}

export interface FigmaFile {
  document: FigmaNode;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface FigmaFileResponse {
  document: FigmaNode;
  components?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface GetImagesOptions extends BaseRequestOptions {
  format?: "png" | "jpg" | "svg" | "pdf";
  scale?: number;
}

export interface PostCommentOptions extends BaseRequestOptions {
  position?: { x: number; y: number };
  parentId?: string;
}

export interface BaseRequestOptions {
  token?: string;
  baseUrl?: string;
  signal?: AbortSignal;
  fetchImpl?: ApiClientOptions["fetchImpl"];
}

export interface ImagesResponse {
  images: Record<string, string>;
  err?: string;
  status?: number;
}

export interface CommentsResponse {
  comments: Array<{
    id: string;
    message: string;
    created_at: string;
    user: { handle: string };
  }>;
}

function removeUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null),
  ) as T;
}

function createClient(options: BaseRequestOptions = {}) {
  const token = options.token ?? process.env.FIGMA_ACCESS_TOKEN;
  if (!token) {
    throw new Error("FIGMA_ACCESS_TOKEN is required to call the Figma API.");
  }

  return new JsonApiClient({
    baseUrl: options.baseUrl ?? DEFAULT_FIGMA_BASE_URL,
    defaultHeaders: {
      "X-Figma-Token": token,
    },
    fetchImpl: options.fetchImpl,
  });
}

export async function getFile(fileKey: string, options: BaseRequestOptions = {}): Promise<FigmaFileResponse> {
  const client = createClient(options);
  return client.get<FigmaFileResponse>(`files/${fileKey}`, { signal: options.signal });
}

function findNodeByName(node: FigmaNode, name: string): FigmaNode | undefined {
  if (node.name === name) {
    return node;
  }

  if (!node.children) {
    return undefined;
  }

  for (const child of node.children) {
    const match = findNodeByName(child, name);
    if (match) {
      return match;
    }
  }

  return undefined;
}

export async function getFrame(fileKey: string, frameName: string, options: BaseRequestOptions = {}): Promise<FigmaNode> {
  const file = await getFile(fileKey, options);
  const frame = findNodeByName(file.document, frameName);
  if (!frame) {
    throw new Error(`Frame "${frameName}" was not found in Figma file ${fileKey}.`);
  }
  return frame;
}

function collectTextNodes(node: FigmaNode, accumulator: string[]): void {
  if (node.type === "TEXT" && typeof node.characters === "string") {
    accumulator.push(node.characters);
  }
  node.children?.forEach((child) => collectTextNodes(child, accumulator));
}

export async function extractText(fileKey: string, options: BaseRequestOptions = {}): Promise<string[]> {
  const file = await getFile(fileKey, options);
  const textNodes: string[] = [];
  collectTextNodes(file.document, textNodes);
  return textNodes;
}

export async function getImages(
  fileKey: string,
  nodeIds: string[],
  options: GetImagesOptions = {},
): Promise<ImagesResponse> {
  if (nodeIds.length === 0) {
    throw new Error("getImages requires at least one node id.");
  }

  const client = createClient(options);
  const query = new URLSearchParams({
    ids: nodeIds.join(","),
  });
  if (options.format) {
    query.set("format", options.format);
  }
  if (options.scale) {
    query.set("scale", String(options.scale));
  }

  return client.get<ImagesResponse>(`images/${fileKey}?${query.toString()}`, {
    signal: options.signal,
  });
}

export async function getComments(fileKey: string, options: BaseRequestOptions = {}): Promise<CommentsResponse> {
  const client = createClient(options);
  return client.get<CommentsResponse>(`files/${fileKey}/comments`, { signal: options.signal });
}

export async function postComment(
  fileKey: string,
  message: string,
  options: PostCommentOptions = {},
): Promise<unknown> {
  const client = createClient(options);
  const payload = removeUndefined({
    message,
    client_meta: options.position,
    parent_id: options.parentId,
  });

  return client.post<typeof payload, unknown>(`files/${fileKey}/comments`, payload, {
    signal: options.signal,
  });
}

export const figma = {
  getFile,
  getFrame,
  extractText,
  getImages,
  getComments,
  postComment,
};
