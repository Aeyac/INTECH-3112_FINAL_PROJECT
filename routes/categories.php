<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('categories')->name('categories.')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])
        ->middleware('permission:view-categories')
        ->name('index');

    Route::post('/', [CategoryController::class, 'store'])
        ->middleware('permission:manage-categories')
        ->name('store');

    Route::put('/{category}', [CategoryController::class, 'update'])
        ->middleware('permission:manage-categories')
        ->name('update');

    Route::delete('/{category}', [CategoryController::class, 'destroy'])
        ->middleware('permission:manage-categories')
        ->name('destroy');

    Route::patch('/{category}/restore', [CategoryController::class, 'restore'])
        ->withTrashed()
        ->middleware('permission:manage-categories')
        ->name('restore');
});
