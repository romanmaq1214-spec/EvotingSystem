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

        if ($selectedElection) {
            $totalElectionVotes = Vote::where('election_id', $selectedElection->id)->count();
            $uniqueVoters = Vote::where('election_id', $selectedElection->id)->distinct('voter_id')->count('voter_id');

            $positions = Position::where('election_id', $selectedElection->id)
                ->with(['candidates' => function ($query) {
                    $query->withCount('votes');
                }])
                ->get();

            foreach ($positions as $pos) {
                $totalPositionVotes = $pos->candidates->sum('votes_count');

                $candidates = $pos->candidates->map(function ($cand) use ($totalPositionVotes) {
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
        ]);
    }
}

