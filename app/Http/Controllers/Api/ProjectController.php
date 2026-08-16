<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectReqeuest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectReqeuest $request): ProjectResource
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): ProjectResource
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): Response
    {
        //
    }
}
