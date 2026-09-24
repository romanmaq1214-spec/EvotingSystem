<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isStudent()) {
            if ($request->user() && $request->user()->isAdmin()) {
                return redirect()->route('admin.dashboard')->with('error', 'Administrators access the admin dashboard.');
            }
            return redirect()->route('login')->with('error', 'Please log in as a student.');
        }

        // Check if student account is active
        $student = $request->user()->student;
        if ($student && $student->status !== 'active') {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'login' => 'Your student account is deactivated. Please contact your school administrator.',
            ]);
        }

        return $next($request);
    }
}

