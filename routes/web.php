<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Auth/Login'));

Route::middleware(['auth'])->group(function () {
    Route::redirect('/', '/dashboard');
});

require __DIR__ . '/categories.php';
require __DIR__ . '/items.php';
require __DIR__ . '/suppliers.php';
require __DIR__ . '/purchases.php';
require __DIR__ . '/sales.php';
require __DIR__ . '/stock-ledger.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/dashboard.php';

