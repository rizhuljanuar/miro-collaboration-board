import {
    onScopeDispose,
    readonly,
    ref,
    watch,
    type Ref,
} from 'vue';

import { echo } from '@/app/echo';
import type { ProjectPresenceUser } from '@/types/presence';

function getChannelName(projectId: number): string {
    return `project.${projectId}`;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'Tidak dapat bergabung ke realtime project presence channel.';
}

export function useProjectPresence(projectId: Ref<number | null>) {
    const activeUsers = ref<ProjectPresenceUser[]>([]);
    const isJoining = ref(false);
    const isJoined = ref(false);
    const errorMessage = ref<string | null>(null);

    let activeChannelName: string | null = null;

    function addActiveUser(user: ProjectPresenceUser): void {
        const userExists = activeUsers.value.some((activeUser) => {
            return activeUser.id === user.id;
        });

        if (userExists) {
            return;
        }

        activeUsers.value = [...activeUsers.value, user];
    }

    function removeActiveUser(userId: number): void {
        activeUsers.value = activeUsers.value.filter((activeUser) => {
            return activeUser.id !== userId;
        });
    }

    function leaveProjectPresence(): void {
        if (activeChannelName) {
            echo.leave(activeChannelName);
        }

        activeChannelName = null;
        activeUsers.value = [];
        isJoining.value = false;
        isJoined.value = false;
        errorMessage.value = null;
    }

    function joinProjectPresence(nextProjectId: number): void {
        leaveProjectPresence();

        const channelName = getChannelName(nextProjectId);

        activeChannelName = channelName;
        isJoining.value = true;
        errorMessage.value = null;

        echo.join(channelName)
            .here((users: ProjectPresenceUser[]) => {
                if (activeChannelName !== channelName) {
                    return;
                }

                activeUsers.value = users;
                isJoining.value = false;
                isJoined.value = true;
            })
            .joining((user: ProjectPresenceUser) => {
                if (activeChannelName !== channelName) {
                    return;
                }

                addActiveUser(user);
            })
            .leaving((user: ProjectPresenceUser) => {
                if (activeChannelName !== channelName) {
                    return;
                }

                removeActiveUser(user.id);
            })
            .error((error: unknown) => {
                if (activeChannelName !== channelName) {
                    return;
                }

                activeUsers.value = [];
                isJoining.value = false;
                isJoined.value = false;
                errorMessage.value = getErrorMessage(error);
            });
    }

    watch(
        projectId,
        (nextProjectId) => {
            if (!nextProjectId) {
                leaveProjectPresence();

                return;
            }

            joinProjectPresence(nextProjectId);
        },
        {
            immediate: true,
        },
    );

    onScopeDispose(() => {
        leaveProjectPresence();
    });

    return {
        activeUsers: readonly(activeUsers),
        errorMessage: readonly(errorMessage),
        isJoined: readonly(isJoined),
        isJoining: readonly(isJoining),
        leaveProjectPresence,
    };
}
