<?php

use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('purchases')->name('purchases.')->group(function () {
    Route::get('/', [PurchaseController::class, 'index'])
        ->middleware('permission:view-purchases')
        ->name('index');

    Route::post('/', [PurchaseController::class, 'store'])
        ->middleware('permission:manage-purchases')
        ->name('store');

    Route::get('/{purchase}', [PurchaseController::class, 'show'])
        ->middleware('permission:view-purchases')
        ->name('show');
});
