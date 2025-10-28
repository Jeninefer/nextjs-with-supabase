import * as Office from "office-js";

function buildNotificationMessage(details = {}) {
  const message = details.message ?? "Action executed successfully.";

  return {
    type: "InformationalMessage",
    icon: "Icon.80x80",
    persistent: true,
    ...details,
    message,
  };
}

async function showNotification(details) {
  const notificationTarget = Office.context?.mailbox?.item?.notificationMessages;

  if (!notificationTarget || typeof notificationTarget.replaceAsync !== "function") {
    return;
  }

  const notification = buildNotificationMessage(details);

  await new Promise((resolve) => {
    const result = notificationTarget.replaceAsync(
      "ActionPerformanceNotification",
      notification,
    );

    if (result && typeof result.then === "function") {
      result.then(() => resolve(undefined)).catch(() => resolve(undefined));
      return;
    }

    resolve(undefined);
  });
}

async function handleAction(event) {
  try {
    await showNotification({
      message: `Action executed at ${new Date().toISOString()}`,
    });
  } finally {
    if (event && typeof event.completed === "function") {
      event.completed();
    }
  }
}

Office.actions.associate("action", handleAction);

export { handleAction };
