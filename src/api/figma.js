/**
 * Figma API Client
 * 
 * Integrates with Figma's REST API to read and manipulate design files.
 * Documentation: https://www.figma.com/developers/api
 */

const FIGMA_CONFIG = {
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileKey: process.env.FIGMA_FILE_KEY || 'nuVKwuPuLS7VmLFvqzOX1G',
  apiUrl: 'https://api.figma.com/v1'
};

/**
 * Validate Figma configuration
 */
export function validateFigmaConfig() {
  if (!FIGMA_CONFIG.accessToken || FIGMA_CONFIG.accessToken.includes('your-figma-token')) {
    console.warn('⚠️ Figma access token is not configured. Please set FIGMA_ACCESS_TOKEN in your .env file.');
    return false;
  }
  return true;
}

/**
 * Make a request to Figma API
 */
async function figmaRequest(endpoint, options = {}) {
  if (!validateFigmaConfig()) {
    throw new Error('Figma is not properly configured');
  }

  const url = `${FIGMA_CONFIG.apiUrl}${endpoint}`;
  const headers = {
    'X-Figma-Token': FIGMA_CONFIG.accessToken,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Figma API request failed:', error);
    throw error;
  }
}

/**
 * Get file data from Figma
 */
export async function getFile(fileKey = FIGMA_CONFIG.fileKey) {
  return await figmaRequest(`/files/${fileKey}`);
}

/**
 * Get specific nodes from a file
 */
export async function getFileNodes(fileKey, nodeIds) {
  const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
  return await figmaRequest(`/files/${fileKey}/nodes?ids=${ids}`);
}

/**
 * Get images/exports from nodes
 */
export async function getImages(fileKey, nodeIds, options = {}) {
  const {
    scale = 1,
    format = 'png',
    svg_include_id = false,
    svg_simplify_stroke = true
  } = options;

  const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
  const params = new URLSearchParams({
    ids,
    scale: scale.toString(),
    format,
    svg_include_id: svg_include_id.toString(),
    svg_simplify_stroke: svg_simplify_stroke.toString()
  });

  return await figmaRequest(`/images/${fileKey}?${params}`);
}

/**
 * Get comments from a file
 */
export async function getComments(fileKey) {
  return await figmaRequest(`/files/${fileKey}/comments`);
}

/**
 * Post a comment to a file
 */
export async function postComment(fileKey, message, position) {
  return await figmaRequest(`/files/${fileKey}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      client_meta: position
    })
  });
}

/**
 * Get current user info
 */
export async function getMe() {
  return await figmaRequest('/me');
}

/**
 * Get team projects
 */
export async function getTeamProjects(teamId) {
  return await figmaRequest(`/teams/${teamId}/projects`);
}

/**
 * Get project files
 */
export async function getProjectFiles(projectId) {
  return await figmaRequest(`/projects/${projectId}/files`);
}

/**
 * Helper: Get specific frame from file
 */
export async function getFrame(fileKey, frameName) {
  const file = await getFile(fileKey);
  
  function findFrame(node) {
    if (node.type === 'FRAME' && node.name === frameName) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const result = findFrame(child);
        if (result) return result;
      }
    }
    return null;
  }

  return findFrame(file.document);
}

/**
 * Helper: Extract text from file
 */
export async function extractText(fileKey) {
  const file = await getFile(fileKey);
  const textNodes = [];

  function traverse(node) {
    if (node.type === 'TEXT') {
      textNodes.push({
        id: node.id,
        name: node.name,
        characters: node.characters,
        style: node.style
      });
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(file.document);
  return textNodes;
}

/**
 * Figma service object
 */
export const figma = {
  getFile,
  getFileNodes,
  getImages,
  getComments,
  postComment,
  getMe,
  getTeamProjects,
  getProjectFiles,
  getFrame,
  extractText,
  config: FIGMA_CONFIG
};

export default figma;
