#!/usr/bin/env node

const ASSIGNEE_LOGIN = (process.env.ASSIGNEE_LOGIN || "Codex").trim();
const OWNER = (process.env.GITHUB_OWNER || "").trim();
const REPO = (process.env.GITHUB_REPO || "").trim();
const TOKEN = process.env.GITHUB_TOKEN;

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

if (!ASSIGNEE_LOGIN) {
  exitWithError("ASSIGNEE_LOGIN (or default) must resolve to a non-empty login name.");
}

if (!OWNER || !REPO) {
  exitWithError(
    "GITHUB_OWNER and GITHUB_REPO environment variables must be provided to identify the repository."
  );
}

if (!TOKEN) {
  exitWithError("GITHUB_TOKEN environment variable must be set with a token that can manage assignees.");
}

const headers = {
  "Accept": "application/vnd.github+json",
  "Authorization": `Bearer ${TOKEN}`,
  "User-Agent": "assign-codex-script"
};

async function fetchOpenPullRequests() {
  const prs = [];
  let page = 1;
  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=open&per_page=100&page=${page}`,
      { headers }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to fetch pull requests (status ${response.status}): ${text || response.statusText}`
      );
    }

    const pageItems = await response.json();

    if (!Array.isArray(pageItems) || pageItems.length === 0) {
      break;
    }

    prs.push(...pageItems);
    page += 1;
  }

  return prs;
}

async function assignToPullRequest(prNumber) {
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/issues/${prNumber}/assignees`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ assignees: [ASSIGNEE_LOGIN] })
    }
  );

  if (response.ok) {
    return true;
  }

  const text = await response.text();

  if (response.status === 422) {
    console.warn(
      `Unable to assign @${ASSIGNEE_LOGIN} to PR #${prNumber}: ${text || "Unprocessable Entity"}`
    );
    return false;
  }

  throw new Error(
    `Failed to assign @${ASSIGNEE_LOGIN} to PR #${prNumber} (status ${response.status}): ${
      text || response.statusText
    }`
  );
}

async function assignCodexToOpenPullRequests() {
  console.log(
    `Assigning @${ASSIGNEE_LOGIN} to all open pull requests in ${OWNER}/${REPO}...`
  );

  const openPRs = await fetchOpenPullRequests();

  if (openPRs.length === 0) {
    console.log("No open pull requests found.");
    return;
  }

  const targetLoginLower = ASSIGNEE_LOGIN.toLowerCase();

  let alreadyAssigned = 0;
  let newlyAssigned = 0;

  for (const pr of openPRs) {
    const assignees = Array.isArray(pr.assignees) ? pr.assignees : [];
    const hasAssignee = assignees.some(
      (assignee) =>
        assignee && typeof assignee.login === "string" && assignee.login.toLowerCase() === targetLoginLower
    );

    if (hasAssignee) {
      alreadyAssigned += 1;
      continue;
    }

    const assigned = await assignToPullRequest(pr.number);

    if (assigned) {
      newlyAssigned += 1;
      console.log(`Assigned @${ASSIGNEE_LOGIN} to PR #${pr.number} (${pr.title}).`);
    }
  }

  console.log(
    `Summary: ${newlyAssigned} newly assigned, ${alreadyAssigned} already assigned, ${openPRs.length} total open PRs.`
  );
}

assignCodexToOpenPullRequests().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

