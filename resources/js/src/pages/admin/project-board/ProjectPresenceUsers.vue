<script setup lang='ts'>
import { computed, ref } from 'vue';

import type { ProjectPresenceUser } from '@/types/presence';

const MAX_VISIBLE_USERS = 4;

const props = defineProps<{
    users: readonly ProjectPresenceUser[];
    isJoined: boolean;
    isJoining: boolean;
    errorMessage: string | null;
}>();

const failedAvatarUserIds = ref<Set<number>>(new Set());

const visibleUsers = computed(() => {
    return props.users.slice(0, MAX_VISIBLE_USERS);
});

const hiddenUsersCount = computed(() => {
    return Math.max(0, props.users.length - MAX_VISIBLE_USERS);
});

const statusLabel = computed(() => {
    if (props.errorMessage) {
        return 'Presence unavailable';
    }

    if (props.isJoining) {
        return 'Connecting presence...';
    }

    if (props.isJoined) {
        return `${props.users.length} active`;
    }

    return 'Presence offline';
});

function getInitials(user: ProjectPresenceUser): string {
    const initials = user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((namePart) => namePart.charAt(0).toUpperCase())
        .join('');

    return initials || '?';
}

function hasAvatarError(userId: number): boolean {
    return failedAvatarUserIds.value.has(userId);
}

function markAvatarAsFailed(userId: number): void {
    failedAvatarUserIds.value = new Set([
        ...failedAvatarUserIds.value,
        userId,
    ]);
}
</script>

<template>
    <div class='flex items-center gap-2'>
        <div
            class='flex -space-x-2'
            :aria-label='`${users.length} active board collaborators`'
        >
            <div
                v-for='user in visibleUsers'
                :key='user.id'
                class='grid size-9 place-items-center overflow-hidden rounded-full border-2 border-white bg-cyan-100 text-xs font-bold text-cyan-800 shadow-sm'
                :title='user.name'
            >
                <img
                    v-if='user.avatar_url && !hasAvatarError(user.id)'
                    :src='user.avatar_url'
                    :alt='`Avatar ${user.name}`'
                    class='size-full object-cover'
                    @error='markAvatarAsFailed(user.id)'
                >

                <span v-else>
                    {{ getInitials(user) }}
                </span>
            </div>

            <div
                v-if='hiddenUsersCount > 0'
                class='grid size-9 place-items-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-700 shadow-sm'
                :title='`${hiddenUsersCount} collaborator lain sedang aktif`'
            >
                +{{ hiddenUsersCount }}
            </div>

            <div
                v-if='isJoining'
                class='grid size-9 place-items-center rounded-full border-2 border-white bg-amber-100 text-xs font-bold text-amber-700 shadow-sm'
                title='Connecting to presence channel'
                aria-label='Connecting to presence channel'
            >
                …
            </div>
        </div>

        <div class='hidden min-w-0 sm:block'>
            <p
                class='max-w-32 truncate text-xs font-semibold text-slate-700'
                :class='errorMessage ? "text-red-700" : ""'
                :title='errorMessage ?? statusLabel'
            >
                {{ errorMessage ?? statusLabel }}
            </p>

            <p v-if='isJoined && !errorMessage' class='text-xs text-slate-500'>
                Live collaborators
            </p>
        </div>
    </div>
</template>
