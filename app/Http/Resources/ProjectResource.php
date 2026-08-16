<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $membership = $this->whenPivotLoaded(
            'project_members',
            fn (): array => [
                'role' => $this->pivot->role,
            ],
        );

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'role' => $membership['role'] ?? null,
            'owner' => $this->whenLoaded('owner', function (): array {
                return [
                    'id' => $this->owner->id,
                    'name' => $this->owner->name,
                    'avatar_url' => $this->owner->avatar_url,
                ];
            }),

            'members_count' => $this->whenCounted('members'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
