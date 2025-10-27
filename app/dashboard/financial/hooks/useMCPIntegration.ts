"use client";

import { useCallback, useEffect, useState } from "react";

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

type MCPConfigEntry =
  | { command: string; args: string[]; env?: Record<string, string | undefined> }
  | { command: string; args: string[] };

type MCPResult<T> = { success: true; data: T } | { success: false; error: string };

function hasEnvConfig(x: unknown): x is { env: Record<string, string | undefined> } {
  return typeof x === "object" && x !== null && "env" in x && typeof (x as Record<string, unknown>).env === "object";
}

const mockMCPClient = {
  initializeServer: async (
    name: string,
    command: string,
    args: string[],
    env?: Record<string, string>,
  ): Promise<boolean> => {
    const envKeys = env ? Object.keys(env).filter((key) => Boolean(env[key])) : [];
    console.log(
      `Mock: Initializing ${name} with ${command} ${args.join(" ")}${
        envKeys.length ? ` (env: ${envKeys.join(", ")})` : ""
      }`,
    );

    return Math.random() > 0.3;
  },
  searchFinancialData: async (query: string): Promise<MCPResult<string>> => ({
    success: true,
    data: `Mock analysis for: ${query}`,
  }),
  fetchMarketData: async (url: string): Promise<MCPResult<string>> => ({
    success: true,
    data: `Mock data from: ${url}`,
  }),
  storeMemory: async (key: string, value: unknown): Promise<MCPResult<string>> => {
    const serialized = (() => {
      if (typeof value === "string") {
        return value;
      }

      if (value === undefined) {
        return "no payload";
      }

      try {
        const raw = JSON.stringify(value);
        return raw ?? "no payload";
      } catch (error) {
        return `unserializable payload (${error instanceof Error ? error.message : "unknown error"})`;
      }
    })();

    const preview = serialized.length > 60 ? `${serialized.slice(0, 57)}...` : serialized;

    return {
      success: true,
      data: `Stored ${key} (${preview})`,
    };
  },
  getMemory: async (key: string): Promise<MCPResult<string>> => ({
    success: true,
    data: `Retrieved ${key}`,
  }),
  disconnect: async (): Promise<void> => {
    console.log("Mock: Disconnected");
  },
};

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set<string>(),
  });

  const initializeMCPServers = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const mcpConfig: Record<string, MCPConfigEntry> = {
        "perplexity-ask": {
          command: "npx",
          args: ["-y", "server-perplexity-ask"],
          env: { PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY },
        },
        fetch: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch"],
        },
        memory: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-memory"],
        },
      };

      const initializedServers = new Set<string>();

      // Bucle con type guards y normalización segura
      for (const [serverName, configRaw] of Object.entries(mcpConfig)) {
        const config = configRaw as MCPConfigEntry;

        if (hasEnvConfig(config)) {
          // Verificar variables de entorno
          const envValues = Object.values(config.env);
          if (!envValues.length || !envValues.every((value) => typeof value === "string" && value.length > 0)) {
            console.warn(`Skipping ${serverName} - missing environment variables`);
            continue;
          }
        }

        // Normalizar env a Record<string, string> o undefined
        const envToPass: Record<string, string> | undefined = hasEnvConfig(config)
          ? Object.fromEntries(
              Object.entries(config.env).map(([key, value]) => [key, value ?? ""]),
            )
          : undefined;

        // Usar mock client por ahora
        const success = await mockMCPClient.initializeServer(
          serverName,
          config.command,
          config.args,
          envToPass
        );

        if (success) {
          initializedServers.add(serverName);
        }
      }

      setState((prev) => ({
        ...prev,
        isInitialized: initializedServers.size > 0,
        isLoading: false,
        servers: initializedServers,
      }));

    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to initialize MCP servers",
      }));
    }
  }, []);

  const buildServerError = useCallback(
    (serverName: string): MCPResult<string> => ({
      success: false,
      error: `Server "${serverName}" is not initialized.`,
    }),
    [],
  );

  const checkServer = useCallback(
    (serverName: string): MCPResult<string> | null => {
      return state.servers.has(serverName) ? null : buildServerError(serverName);
    },
    [buildServerError, state.servers],
  );

  const searchFinancialInsights = useCallback(
    async (query: string): Promise<MCPResult<string>> => {
      const serverCheck = checkServer("perplexity-ask");
      if (serverCheck) return serverCheck;
      return mockMCPClient.searchFinancialData(query);
    },
    [checkServer],
  );

  const fetchMarketData = useCallback(
    async (source: string): Promise<MCPResult<string>> => {
      const serverCheck = checkServer("fetch");
      if (serverCheck) return serverCheck;
      return mockMCPClient.fetchMarketData(source);
    },
    [checkServer],
  );

  const storeAnalysisResult = useCallback(
    async (analysisId: string, result: unknown): Promise<MCPResult<string>> => {
      const serverCheck = checkServer("memory");
      if (serverCheck) return serverCheck;
      return mockMCPClient.storeMemory(`analysis_${analysisId}`, result);
    },
    [checkServer],
  );

  const getStoredAnalysis = useCallback(
    async (analysisId: string): Promise<MCPResult<string>> => {
      const serverCheck = checkServer("memory");
      if (serverCheck) return serverCheck;
      return mockMCPClient.getMemory(`analysis_${analysisId}`);
    },
    [checkServer],
  );

  useEffect(() => {
    initializeMCPServers();
    return () => {
      void mockMCPClient.disconnect();
    };
  }, [initializeMCPServers]);

  return {
    ...state,
    initializeMCPServers,
    searchFinancialInsights,
    fetchMarketData,
    storeAnalysisResult,
    getStoredAnalysis,
  };
}
