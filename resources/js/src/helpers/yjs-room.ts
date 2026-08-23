export function getProjectBoardYjsRoomId(projectId: number): string {
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new Error('Project ID untuk Yjs room harus berupa integer positif.');
  }

  return `project-board-${projectId}`;
}

export function isProjectBoardYjsRoom(roomId: string | null): boolean {
  return roomId?.startsWith('project-board-') ?? false;
}
