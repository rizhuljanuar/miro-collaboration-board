<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::view('/login', 'welcome')->name('spa.login');

Route::view('/app/{path?}', 'welcome')
    ->where('path', '.*')
    ->name('spa.application');
