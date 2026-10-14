<?php

use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('sales')->name('sales.')->group(function () {
    Route::get('/', [SaleController::class, 'index'])
        ->middleware('permission:view-sales')
        ->name('index');

    Route::post('/', [SaleController::class, 'store'])
        ->middleware('permission:record-sales')
        ->name('store');

    Route::get('/{sale}', [SaleController::class, 'show'])
        ->middleware('permission:view-sales')
        ->name('show');
});
