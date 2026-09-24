<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            if ($request->user() && $request->user()->isStudent()) {
                return redirect()->route('student.dashboard')->with('error', 'Unauthorized access to admin area.');
            }
            return redirect()->route('login')->with('error', 'Please log in as an administrator.');
        }

        return $next($request);
    }
}

