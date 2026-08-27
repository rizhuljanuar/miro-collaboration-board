<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    'project.{projectId}',
    function (User $user, int $projectId): array|bool {
        $isProjectMember = $user->projects()
            ->whereKey($projectId)
            ->exists();

        if (! $isProjectMember) {
            return false;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar_url' => $user->avatar_url,
        ];
    },
);
