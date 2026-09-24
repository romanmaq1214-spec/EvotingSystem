<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\Student;
use App\Models\Vote;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalStudents = Student::count();
        $totalCandidates = Candidate::count();
        $totalPositions = Position::count();
        $activeElections = Election::where('status', 'Open')->count();
        $totalVotes = Vote::count();

        // Current / Active Election
        $currentElection = Election::where('status', 'Open')->latest()->first()
            ?? Election::latest()->first();

        $electionStats = null;
        if ($currentElection) {
            $uniqueVotersCount = Vote::where('election_id', $currentElection->id)
                ->distinct('voter_id')
                ->count('voter_id');

            $activeStudentsCount = Student::where('status', 'active')->count();
            $participationRate = $activeStudentsCount > 0
                ? round(($uniqueVotersCount / $activeStudentsCount) * 100, 1)
                : 0;

            $electionStats = [
                'id' => $currentElection->id,
                'title' => $currentElection->title,
                'description' => $currentElection->description,
                'status' => $currentElection->status,
                'start_date' => $currentElection->start_date?->format('M d, Y h:i A'),
                'end_date' => $currentElection->end_date?->format('M d, Y h:i A'),
                'total_positions' => $currentElection->positions()->count(),
                'total_candidates' => $currentElection->candidates()->count(),
                'votes_cast' => $currentElection->votes()->count(),
                'unique_voters' => $uniqueVotersCount,
                'participation_rate' => $participationRate,
            ];
        }

        // Recent Activity: Last 8 votes
        $recentVotes = Vote::with(['candidate:id,name,party', 'position:id,name', 'student:id,student_id,course,year_level'])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'position_name' => $vote->position?->name,
                    'candidate_name' => $vote->candidate?->name,
                    'candidate_party' => $vote->candidate?->party,
                    'voter_code' => $vote->student ? substr($vote->student->student_id, 0, 4) . '-****' : 'Anonymous',
                    'voter_course' => $vote->student?->course,
                    'time_ago' => $vote->created_at?->diffForHumans(),
                ];
            });

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'total_students' => $totalStudents,
                'total_candidates' => $totalCandidates,
                'total_positions' => $totalPositions,
                'active_elections' => $activeElections,
                'total_votes' => $totalVotes,
            ],
            'current_election' => $electionStats,
            'recent_activity' => $recentVotes,
        ]);
    }
}

