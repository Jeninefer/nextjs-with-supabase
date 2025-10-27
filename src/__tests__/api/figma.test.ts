import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { extractText, figma, getComments, getFile, getFrame, getImages, postComment } from "@/api/figma";
import { createJsonResponse, restoreFetchMock, useFetchMock } from "@/__tests__/api/test-utils";

const sampleFile = {
  document: {
    id: "1",
    name: "Root",
    type: "DOCUMENT",
    children: [
      {
        id: "2",
        name: "Deck 2",
        type: "FRAME",
        children: [
          { id: "3", name: "Title", type: "TEXT", characters: "Hello" },
          { id: "4", name: "Subtitle", type: "TEXT", characters: "World" },
        ],
      },
    ],
  },
  name: "Demo",
  lastModified: "2024-01-01",
  thumbnailUrl: "https://example.com/thumb.png",
  version: "1",
};

describe("figma", () => {
  beforeEach(() => {
    process.env.FIGMA_ACCESS_TOKEN = "figd_token";
  });

  afterEach(() => {
    delete process.env.FIGMA_ACCESS_TOKEN;
    restoreFetchMock();
  });

  it("fetches file metadata", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(sampleFile));

    const file = await getFile("fileKey");
    expect(file.name).toBe("Demo");
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.figma.com/v1/files/fileKey");
  });

  it("locates frames by name", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(sampleFile));

    const frame = await getFrame("fileKey", "Deck 2");
    expect(frame.id).toBe("2");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when a frame cannot be found", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(sampleFile));

    await expect(getFrame("fileKey", "Unknown")).rejects.toThrow(/Frame "Unknown"/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("extracts all text nodes", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(sampleFile));

    const textNodes = await extractText("fileKey");
    expect(textNodes).toEqual(["Hello", "World"]);
  });

  it("constructs image export requests with query parameters", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse({ images: { A: "url" } }));

    await getImages("fileKey", ["A"], { format: "png", scale: 2 });
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.figma.com/v1/images/fileKey?ids=A&format=png&scale=2");
  });

  it("posts comments with optional metadata", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true }));

    await postComment("fileKey", "Great design!", { position: { x: 10, y: 20 } });
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe("POST");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body).toMatchObject({
      message: "Great design!",
      client_meta: { x: 10, y: 20 },
    });
  });

  it("exposes convenience helpers via the figma namespace", async () => {
    const fetchMock = useFetchMock();
    fetchMock
      .mockResolvedValueOnce(createJsonResponse(sampleFile))
      .mockResolvedValueOnce(createJsonResponse({ comments: [] }))
      .mockResolvedValueOnce(createJsonResponse({ images: {} }));

    await figma.getFile("fileKey");
    await getComments("fileKey");
    await figma.getImages("fileKey", ["1"]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
