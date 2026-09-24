<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CandidateController extends Controller
{
    public function index(Request $request): Response
    {
        $electionId = $request->query('election_id');
        $positionId = $request->query('position_id');

        $elections = Election::select('id', 'title', 'status')->latest()->get();
        $selectedElectionId = $electionId ?? $elections->first()?->id;

        $positions = Position::where('election_id', $selectedElectionId)->get();
        $students = Student::where('status', 'active')->select('id', 'student_id', 'first_name', 'last_name')->get();

        $candidates = Candidate::query()
            ->when($selectedElectionId, fn ($q, $id) => $q->where('election_id', $id))
            ->when($positionId, fn ($q, $id) => $q->where('position_id', $id))
            ->with(['position:id,name', 'election:id,title', 'student:id,student_id,first_name,last_name'])
            ->withCount('votes')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/Candidates', [
            'candidates' => $candidates,
            'elections' => $elections,
            'positions' => $positions,
            'students' => $students,
            'filters' => [
                'election_id' => $selectedElectionId,
                'position_id' => $positionId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'election_id' => ['required', 'exists:elections,id'],
            'position_id' => ['required', 'exists:positions,id'],
            'student_id' => ['nullable', 'exists:students,id'],
            'name' => ['required', 'string', 'max:150'],
            'party' => ['required', 'string', 'max:150'],
            'platform' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'photo' => ['nullable', 'image', 'max:2048'], // 2MB max
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('candidates', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        Candidate::create($validated);

        return back()->with('success', 'Candidate added successfully.');
    }

    public function update(Request $request, Candidate $candidate): RedirectResponse
    {
        $validated = $request->validate([
            'election_id' => ['required', 'exists:elections,id'],
            'position_id' => ['required', 'exists:positions,id'],
            'student_id' => ['nullable', 'exists:students,id'],
            'name' => ['required', 'string', 'max:150'],
            'party' => ['required', 'string', 'max:150'],
            'platform' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($candidate->photo && str_starts_with($candidate->photo, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $candidate->photo);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('photo')->store('candidates', 'public');
            $validated['photo'] = '/storage/' . $path;
        }

        $candidate->update($validated);

        return back()->with('success', 'Candidate updated successfully.');
    }

    public function destroy(Candidate $candidate): RedirectResponse
    {
        if ($candidate->photo && str_starts_with($candidate->photo, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $candidate->photo);
            Storage::disk('public')->delete($oldPath);
        }

        $candidate->delete();

        return back()->with('success', 'Candidate deleted successfully.');
    }
}

