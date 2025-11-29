// Simple in-memory store for development
declare global {
  var commandQueues: Record<string, unknown[]>;
  var pluginStatuses: Record<string, { connected: boolean; lastSeen: number }>;
  var userTokens: Record<string, string>; // token -> userId
  var projectStates: Record<string, any>; // userId -> project tree
}

if (!globalThis.commandQueues) globalThis.commandQueues = {};
if (!globalThis.pluginStatuses) globalThis.pluginStatuses = {};
if (!globalThis.userTokens) globalThis.userTokens = {};
if (!globalThis.projectStates) globalThis.projectStates = {};

export const getQueue = (userId: string) => {
  if (!globalThis.commandQueues[userId]) globalThis.commandQueues[userId] = [];
  return globalThis.commandQueues[userId];
};

export const consumeQueue = (userId: string) => {
  const queue = getQueue(userId);
  const items = [...queue];
  globalThis.commandQueues[userId] = [];
  return items;
};

export const addToQueue = (cmd: unknown, userId: string) => {
  const queue = getQueue(userId);
  queue.push(cmd);
};

export const updateStatus = (connected: boolean, userId: string) => {
  globalThis.pluginStatuses[userId] = { connected, lastSeen: Date.now() };
};

export const getStatus = (userId: string) => {
  const status = globalThis.pluginStatuses[userId] || { connected: false, lastSeen: 0 };
  // Check if stale (e.g. > 5 seconds)
  const now = Date.now();
  if (now - status.lastSeen > 5000) {
    return { connected: false, lastSeen: status.lastSeen };
  }
  return status;
};

export const generateToken = (userId: string) => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  globalThis.userTokens[token] = userId;
  return token;
};

export const getUserIdFromToken = (token: string) => {
  return globalThis.userTokens[token];
};

export const revokeToken = (token: string) => {
  delete globalThis.userTokens[token];
};

export const updateProjectState = (userId: string, state: any) => {
  globalThis.projectStates[userId] = state;
};

export const getProjectState = (userId: string) => {
  return globalThis.projectStates[userId] || null;
};

