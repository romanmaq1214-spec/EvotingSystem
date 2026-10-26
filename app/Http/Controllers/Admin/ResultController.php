<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Position;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function index(Request $request): Response
    {
        $electionId = $request->query('election_id');

        $elections = Election::select('id', 'title', 'status', 'start_date', 'end_date')->latest()->get();
        $selectedElection = $electionId ? Election::find($electionId) : ($elections->where('status', 'Open')->first() ?? $elections->first());

        $positionsData = [];
        $totalElectionVotes = 0;
        $uniqueVoters = 0;
        $departmentVotes = [];
        $departments = ['BSIT', 'BSAB', 'BEED', 'OTHER'];

        if ($selectedElection) {
            $totalElectionVotes = Vote::where('election_id', $selectedElection->id)->count();
            $uniqueVoters = Vote::where('election_id', $selectedElection->id)->distinct('voter_id')->count('voter_id');

            Vote::where('election_id', $selectedElection->id)
                ->with('student:id,course')
                ->get(['candidate_id', 'position_id', 'voter_id'])
                ->each(function (Vote $vote) use (&$departmentVotes) {
                    $department = $this->departmentCodeFor($vote->student?->course ?? '') ?? 'OTHER';
                    $departmentVotes[$vote->position_id][$vote->candidate_id][$department] =
                        ($departmentVotes[$vote->position_id][$vote->candidate_id][$department] ?? 0) + 1;
                });

            $positions = Position::where('election_id', $selectedElection->id)
                ->with(['candidates' => function ($query) {
                    $query->withCount('votes');
                }])
                ->get();

            foreach ($positions as $pos) {
                $totalPositionVotes = $pos->candidates->sum('votes_count');

                $candidates = $pos->candidates->map(function ($cand) use ($totalPositionVotes, $departmentVotes, $departments, $pos) {
                    $percentage = $totalPositionVotes > 0
                        ? round(($cand->votes_count / $totalPositionVotes) * 100, 1)
                        : 0;

                    return [
                        'id' => $cand->id,
                        'name' => $cand->name,
                        'party' => $cand->party,
                        'photo' => $cand->photo,
                        'votes_count' => $cand->votes_count,
                        'percentage' => $percentage,
                        'department_votes' => collect($departments)->map(fn ($department) => [
                            'department' => $department,
                            'votes_count' => $departmentVotes[$pos->id][$cand->id][$department] ?? 0,
                        ])->all(),
                    ];
                })->sortByDesc('votes_count')->values();

                $positionsData[] = [
                    'id' => $pos->id,
                    'name' => $pos->name,
                    'description' => $pos->description,
                    'total_votes' => $totalPositionVotes,
                    'candidates' => $candidates,
                ];
            }
        }

        return Inertia::render('admin/Results', [
            'elections' => $elections,
            'selected_election' => $selectedElection ? [
                'id' => $selectedElection->id,
                'title' => $selectedElection->title,
                'status' => $selectedElection->status,
                'start_date' => $selectedElection->start_date?->format('M d, Y h:i A'),
                'end_date' => $selectedElection->end_date?->format('M d, Y h:i A'),
                'total_votes' => $totalElectionVotes,
                'unique_voters' => $uniqueVoters,
            ] : null,
            'results' => $positionsData,
            'departments' => $departments,
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

