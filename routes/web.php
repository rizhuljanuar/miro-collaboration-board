<?php

use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])
    ->name('auth.google.redirect');

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
    ->name('auth.google.callback');

Route::prefix('api/auth')->group(function (): void {
    Route::get('/user', [GoogleAuthController::class, 'currentUser'])
        ->middleware('auth')
        ->name('api.auth.user');

    Route::post('/logout', [GoogleAuthController::class, 'logout'])
        ->middleware('auth')
        ->name('api.auth.logout');
});

Route::middleware('auth')
    ->prefix('api')
    ->group(function (): void {
        Route::apiResource('projects', ProjectController::class);
    });

Route::view('/login', 'welcome')->name('spa.login');

Route::view('/app/{path?}', 'welcome')
    ->where('path', '.*')
    ->name('spa.application');
