export type MockRouter = {
  history: string[];
  push: (path: string) => void;
  replace: (path: string) => void;
  prefetch: (path: string) => Promise<void>;
  back: () => void;
  forward: () => void;
  refresh: () => void;
};

const history: string[] = [];

const createRouter = (): MockRouter => ({
  history,
  push: (path: string) => {
    history.push(path);
  },
  replace: (path: string) => {
    if (history.length > 0) {
      history[history.length - 1] = path;
    } else {
      history.push(path);
    }
  },
  prefetch: async () => {
    // no-op mock
  },
  back: () => {
    if (history.length > 0) {
      history.pop();
    }
  },
  forward: () => {
    // no-op mock
  },
  refresh: () => {
    // no-op mock
  },
});

const router = createRouter();

export const __router = router;

export function resetRouterMock() {
  history.splice(0, history.length);
}

export function useRouter(): MockRouter {
  return router;
}
