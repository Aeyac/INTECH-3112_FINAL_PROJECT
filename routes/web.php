<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Auth/Login'));

Route::middleware(['auth'])->group(function () {
    Route::get('/home', fn () => Inertia::render('Home'))->name('home');
});

require __DIR__.'/categories.php';
require __DIR__.'/items.php';
require __DIR__.'/suppliers.php';
