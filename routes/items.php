<?php

use App\Http\Controllers\ItemController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('items')->name('items.')->group(function () {
    Route::get('/', [ItemController::class, 'index'])
        ->middleware('permission:view-items')
        ->name('index');

    Route::post('/', [ItemController::class, 'store'])
        ->middleware('permission:manage-items')
        ->name('store');

    Route::put('/{item}', [ItemController::class, 'update'])
        ->middleware('permission:manage-items')
        ->name('update');

    Route::delete('/{item}', [ItemController::class, 'destroy'])
        ->middleware('permission:manage-items')
        ->name('destroy');

    Route::patch('/{item}/restore', [ItemController::class, 'restore'])
        ->withTrashed()
        ->middleware('permission:manage-items')
        ->name('restore');
});
