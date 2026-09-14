<?php

use App\Events\BoardTestEvent;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'application' => config('app.name')
    ]);
});

Route::get('/broadcast-test', function () {
    broadcast(new BoardTestEvent(
        message: 'Broadcating Reverb berhasil.',
    ));

    return response()->json([
        'status' => 'sent',
    ]);
});
