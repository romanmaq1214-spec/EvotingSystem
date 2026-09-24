<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login view.
     */
    public function showLogin(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();
            if ($user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('student.dashboard');
        }

        return Inertia::render('Login', [
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'login.required' => 'Student ID or Email is required.',
            'password.required' => 'Password is required.',
        ]);

        $loginInput = trim($credentials['login']);

        $user = User::where('email', $loginInput)
            ->orWhere('student_id', $loginInput)
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => 'The provided credentials do not match our school records.',
            ]);
        }

        // Verify student record & status if student role
        if ($user->isStudent()) {
            $student = $user->student;

            if (! $student) {
                throw ValidationException::withMessages([
                    'login' => 'Access denied: No registered student record found for this account. Only students added by the administrator can log in.',
                ]);
            }

            if ($student->status !== 'active') {
                throw ValidationException::withMessages([
                    'login' => 'Your student account has been deactivated. Please contact the administrator.',
                ]);
            }
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return redirect()->intended(route('student.dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('status', 'You have been logged out safely.');
    }
}

