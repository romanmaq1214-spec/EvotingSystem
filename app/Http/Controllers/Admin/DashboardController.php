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
            $activeStudents = Student::where('status', 'active')->get(['id', 'course']);
            $activeStudentsCount = $activeStudents->count();
            $uniqueVotersCount = Vote::where('election_id', $currentElection->id)
                ->whereHas('student', fn ($query) => $query->where('status', 'active'))
                ->distinct('voter_id')
                ->count('voter_id');
            $votedStudentIds = Vote::where('election_id', $currentElection->id)
                ->distinct('voter_id')
                ->pluck('voter_id')
                ->flip();

            $departmentCounts = [
                'BSIT' => ['voted' => 0, 'total' => 0],
                'BSAB' => ['voted' => 0, 'total' => 0],
                'BEED' => ['voted' => 0, 'total' => 0],
            ];

            foreach ($activeStudents as $student) {
                $department = $this->departmentCodeFor($student->course);
                if (! $department) {
                    continue;
                }

                $departmentCounts[$department]['total']++;
                if ($votedStudentIds->has($student->id)) {
                    $departmentCounts[$department]['voted']++;
                }
            }

            $departmentParticipation = collect($departmentCounts)
                ->map(fn (array $counts, string $department) => [
                    'department' => $department,
                    'voted' => $counts['voted'],
                    'total' => $counts['total'],
                    'not_voted' => $counts['total'] - $counts['voted'],
                    'participation_rate' => $counts['total'] > 0
                        ? round(($counts['voted'] / $counts['total']) * 100, 1)
                        : 0,
                ])
                ->values()
                ->all();

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
                'eligible_students' => $activeStudentsCount,
                'not_voted_students' => max($activeStudentsCount - $uniqueVotersCount, 0),
                'participation_rate' => $participationRate,
                'department_participation' => $departmentParticipation,
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

    private function departmentCodeFor(string $course): ?string
    {
        $normalizedCourse = strtoupper(preg_replace('/[^a-z0-9]+/i', '', $course) ?? '');

        return match (true) {
            str_starts_with($normalizedCourse, 'BSIT'), str_contains($normalizedCourse, 'INFORMATIONTECHNOLOGY') => 'BSIT',
            str_starts_with($normalizedCourse, 'BSAB'), str_contains($normalizedCourse, 'AGRIBUSINESS'), str_contains($normalizedCourse, 'AGRICULTURALBUSINESS') => 'BSAB',
            str_starts_with($normalizedCourse, 'BEED'), str_contains($normalizedCourse, 'ELEMENTARYEDUCATION') => 'BEED',
            default => null,
        };
    }
}
