<?php

use App\Http\Controllers\StockLedgerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('stock-ledger')->name('ledger.')->group(function () {
    Route::get('/', [StockLedgerController::class, 'index'])
        ->middleware('permission:view-ledger')
        ->name('index');

    Route::post('/', [StockLedgerController::class, 'store'])
        ->middleware('permission:adjust-stock')
        ->name('store');
});
