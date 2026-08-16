<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectReqeuest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $perPage = (int) $request->validated('per_page', 12);

        $projects = $user->projects()
            ->with('owner:id,name,avatar_url')
            ->withCount('members')
            ->orderByDesc('projects.updated_at')
            ->paginate($perPage)
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectReqeuest $request): JsonResponse
    {
        $user = $request->user();

        $project = DB::transaction(function () use ($request, $user): Project {
            $project = $user->ownedProjects()->create($request->validated());

            $project->members()->attach($user->id, [
                'role' => 'owner',
            ]);

            return $project;
        });

        $project = $this->projectForUser($request, $project->id);

        return (new ProjectResource($project))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $project): ProjectResource
    {
        return new ProjectResource(
            $this->projectForUser($request, $project),
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, int $project): ProjectResource
    {
        $projectModel = $this->projectForUser($request, $project);

        $this->ensureOwner($projectModel);

        $projectModel->update($request->validated());

        $projectModel->load('owner:id,name,avatar_url');
        $projectModel->loadCount('members');

        return new ProjectResource($projectModel);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $project): Response
    {
        $projectModel = $this->projectForUser($request, $project);

        $this->ensureOwner($projectModel);

        $projectModel->delete();

        return response()->noContent();
    }

    private function projectForUser(Request $request, int $projectId): Project
    {
        $user = $request->user();

        return $user->projects()
            ->with('owner:id,name,avatar_url')
            ->withCount('members')
            ->findOrFail($projectId);
    }

    private function ensureOwner(Project $project): void
    {
        abort_unless(
            $project->pivot?->role === 'owner',
            Response::HTTP_FORBIDDEN,
            'Only the project owner can perform this action',
        );
    }
}
