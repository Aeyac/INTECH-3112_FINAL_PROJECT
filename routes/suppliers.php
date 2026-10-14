<?php

use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('suppliers')->name('suppliers.')->group(function () {
    Route::get('/', [SupplierController::class, 'index'])
        ->middleware('permission:view-suppliers')
        ->name('index');

    Route::post('/', [SupplierController::class, 'store'])
        ->middleware('permission:manage-suppliers')
        ->name('store');

    Route::put('/{supplier}', [SupplierController::class, 'update'])
        ->middleware('permission:manage-suppliers')
        ->name('update');

    Route::delete('/{supplier}', [SupplierController::class, 'destroy'])
        ->middleware('permission:manage-suppliers')
        ->name('destroy');

    Route::patch('/{supplier}/restore', [SupplierController::class, 'restore'])
        ->withTrashed()
        ->middleware('permission:manage-suppliers')
        ->name('restore');
});
