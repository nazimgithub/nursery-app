<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CheckInController;

Route::middleware('tenant')->group(function () {

    Route::post(
        '/rooms/{room}/check-ins',
        [CheckInController::class, 'checkIn']
    );

    Route::post(
        '/check-ins/{id}/check-out',
        [CheckInController::class, 'checkOut']
    );

    Route::get(
        '/rooms/{room}/occupants',
        [CheckInController::class, 'occupants']
    );

});