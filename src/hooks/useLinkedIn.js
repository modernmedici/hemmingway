// Stub — full implementation in Task 7
export function useLinkedIn() {
  return {
    token: null,
    profile: null,
    isConnected: false,
    publishing: false,
    publishError: null,
    connect: () => {},
    disconnect: () => {},
    receiveToken: () => {},
    publishPost: async () => {},
  };
}
