<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    public function index(): Response
    {
        $elections = Election::withCount(['positions', 'candidates', 'votes'])
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/Elections', [
            'elections' => $elections,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', Rule::in(['Draft', 'Upcoming', 'Open', 'Closed'])],
        ]);

        Election::create($validated);

        return redirect()->route('admin.elections.index')->with('success', 'Election created successfully.');
    }

    public function update(Request $request, Election $election): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', Rule::in(['Draft', 'Upcoming', 'Open', 'Closed'])],
        ]);

        $election->update($validated);

        return redirect()->route('admin.elections.index')->with('success', 'Election updated successfully.');
    }

    public function updateStatus(Request $request, Election $election): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Draft', 'Upcoming', 'Open', 'Closed'])],
        ]);

        $election->update(['status' => $validated['status']]);

        return back()->with('success', "Election status updated to {$validated['status']}.");
    }

    public function destroy(Election $election): RedirectResponse
    {
        $election->delete();

        return redirect()->route('admin.elections.index')->with('success', 'Election deleted successfully.');
    }
}

