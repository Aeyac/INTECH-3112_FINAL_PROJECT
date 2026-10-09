<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Home'));


Route::middleware(['auth', 'verified'])->group(function () {
    
});