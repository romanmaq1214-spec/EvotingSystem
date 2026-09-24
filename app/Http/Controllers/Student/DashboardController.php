<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $student = $user->student;

        // Current active election (or upcoming/most recent)
        $currentElection = Election::where('status', 'Open')->latest()->first()
            ?? Election::latest()->first();

        $hasVoted = false;
        $votedSelections = [];

        if ($currentElection && $student) {
            $hasVoted = $student->hasVotedIn($currentElection);

            if ($hasVoted) {
                $votedSelections = Vote::where('election_id', $currentElection->id)
                    ->where('voter_id', $student->id)
                    ->with(['position:id,name', 'candidate:id,name,party'])
                    ->get()
                    ->map(fn ($v) => [
                        'position' => $v->position?->name,
                        'candidate' => $v->candidate?->name,
                        'party' => $v->candidate?->party,
                    ]);
            }
        }

        return Inertia::render('student/Dashboard', [
            'student' => [
                'id' => $student?->id,
                'student_id' => $student?->student_id,
                'name' => $student?->fullName ?? $user->name,
                'course' => $student?->course,
                'year_level' => $student?->year_level,
            ],
            'current_election' => $currentElection ? [
                'id' => $currentElection->id,
                'title' => $currentElection->title,
                'description' => $currentElection->description,
                'status' => $currentElection->status,
                'start_date' => $currentElection->start_date?->format('M d, Y h:i A'),
                'end_date' => $currentElection->end_date?->format('M d, Y h:i A'),
                'is_open' => $currentElection->isOpen(),
                'positions_count' => $currentElection->positions()->count(),
                'candidates_count' => $currentElection->candidates()->count(),
            ] : null,
            'has_voted' => $hasVoted,
            'voted_selections' => $votedSelections,
        ]);
    }
}

