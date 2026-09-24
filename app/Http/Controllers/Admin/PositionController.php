<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PositionController extends Controller
{
    public function index(Request $request): Response
    {
        $electionId = $request->query('election_id');

        $elections = Election::select('id', 'title', 'status')->latest()->get();
        $selectedElectionId = $electionId ?? $elections->first()?->id;

        $positions = Position::query()
            ->when($selectedElectionId, function ($query, $id) {
                $query->where('election_id', $id);
            })
            ->with('election:id,title')
            ->withCount('candidates')
            ->latest()
            ->get();

        return Inertia::render('admin/Positions', [
            'positions' => $positions,
            'elections' => $elections,
            'selected_election_id' => $selectedElectionId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'election_id' => ['required', 'exists:elections,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'max_votes' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        Position::create($validated);

        return back()->with('success', 'Position created successfully.');
    }

    public function update(Request $request, Position $position): RedirectResponse
    {
        $validated = $request->validate([
            'election_id' => ['required', 'exists:elections,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'max_votes' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $position->update($validated);

        return back()->with('success', 'Position updated successfully.');
    }

    public function destroy(Position $position): RedirectResponse
    {
        $position->delete();

        return back()->with('success', 'Position deleted successfully.');
    }
}

