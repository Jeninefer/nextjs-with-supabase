const registeredActions = new Map();

const actions = {
  associate(name, handler) {
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("Action name must be a non-empty string");
    }

    if (typeof handler !== "function") {
      throw new Error("Action handler must be a function");
    }

    registeredActions.set(name, handler);
    return handler;
  },
  /**
   * Helper exposed for tests and debugging.
   */
  __getRegisteredActions() {
    return registeredActions;
  },
};

const createReplaceAsync = () => {
  const implementation = (key, message, callback) => {
    if (typeof callback === "function") {
      callback({ status: "succeeded" });
    }
    return Promise.resolve({ key, message });
  };

  if (typeof jest !== "undefined" && typeof jest.fn === "function") {
    return jest.fn(implementation);
  }

  return implementation;
};

const notificationMessages = {
  replaceAsync: createReplaceAsync(),
};

const context = {
  mailbox: {
    item: {
      notificationMessages,
    },
  },
};

module.exports = {
  actions,
  context,
};
