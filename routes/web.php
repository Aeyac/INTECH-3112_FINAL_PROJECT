<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Auth/Login'));


Route::middleware(['auth'])->group(function () {
    Route::get('/home', fn() => Inertia::render('Home'))->name('home');
});
