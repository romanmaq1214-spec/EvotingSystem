<?php

use App\Http\Controllers\Admin\CandidateController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ResultController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\VotingController;
use Illuminate\Support\Facades\Route;

// Guest & Landing Redirection
Route::get('/', function () {
    if (auth()->check()) {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        return $user->isAdmin()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('student.dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Admin Routes (Protected by auth & admin middleware)
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Admin Profile & Credentials Management
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Student Management
    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::patch('/students/{student}/toggle-status', [StudentController::class, 'toggleStatus'])->name('students.toggle-status');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

    // Election Management
    Route::get('/elections', [ElectionController::class, 'index'])->name('elections.index');
    Route::post('/elections', [ElectionController::class, 'store'])->name('elections.store');
    Route::put('/elections/{election}', [ElectionController::class, 'update'])->name('elections.update');
    Route::patch('/elections/{election}/status', [ElectionController::class, 'updateStatus'])->name('elections.update-status');
    Route::delete('/elections/{election}', [ElectionController::class, 'destroy'])->name('elections.destroy');

    // Position Management
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
    Route::put('/positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::delete('/positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');

    // Candidate Management
    Route::get('/candidates', [CandidateController::class, 'index'])->name('candidates.index');
    Route::post('/candidates', [CandidateController::class, 'store'])->name('candidates.store');
    Route::post('/candidates/{candidate}', [CandidateController::class, 'update'])->name('candidates.update');
    Route::delete('/candidates/{candidate}', [CandidateController::class, 'destroy'])->name('candidates.destroy');

    // Results
    Route::get('/results', [ResultController::class, 'index'])->name('results.index');
});

// Student Routes (Protected by auth & student middleware)
Route::prefix('student')->name('student.')->middleware(['auth', 'student'])->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    Route::get('/voting', [VotingController::class, 'showBallot'])->name('voting');
    Route::post('/review', [VotingController::class, 'review'])->name('review');
    Route::post('/submit-vote', [VotingController::class, 'submitVote'])->name('submit-vote');
    Route::get('/success', [VotingController::class, 'showSuccess'])->name('success');
});
