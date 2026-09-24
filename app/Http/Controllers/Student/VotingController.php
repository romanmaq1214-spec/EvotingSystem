<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VotingController extends Controller
{
    protected function getStudent($user): ?Student
    {
        return $user?->student;
    }

    /**
     * Display the voting ballot.
     */
    public function showBallot(Request $request): Response|RedirectResponse
    {
        $student = $this->getStudent($request->user());
        if (! $student) {
            return redirect()->route('login')->withErrors(['login' => 'Student record not found.']);
        }

        $election = Election::where('status', 'Open')->latest()->first();
        if (! $election) {
            return redirect()->route('student.dashboard')->with('error', 'There is currently no active open election.');
        }

        if ($student->hasVotedIn($election)) {
            return redirect()->route('student.dashboard')->with('info', 'You have already submitted your vote in this election.');
        }

        $positions = Position::where('election_id', $election->id)
            ->with(['candidates' => function ($query) {
                $query->where('status', 'active');
            }])
            ->get();

        return Inertia::render('student/Voting', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
                'start_date' => $election->start_date?->format('M d, Y h:i A'),
                'end_date' => $election->end_date?->format('M d, Y h:i A'),
            ],
            'positions' => $positions,
        ]);
    }

    /**
     * Review the selections before final submission.
     */
    public function review(Request $request): Response|RedirectResponse
    {
        $student = $this->getStudent($request->user());
        if (! $student) {
            return redirect()->route('login');
        }

        $electionId = $request->input('election_id');
        $election = Election::find($electionId);

        if (! $election || ! $election->isOpen()) {
            return redirect()->route('student.dashboard')->with('error', 'Election is not open.');
        }

        if ($student->hasVotedIn($election)) {
            return redirect()->route('student.dashboard')->with('info', 'You have already voted in this election.');
        }

        $votesInput = $request->input('votes', []); // [position_id => candidate_id]

        $positions = Position::where('election_id', $election->id)->get();
        $candidateIds = array_values(array_filter($votesInput));
        $candidates = Candidate::whereIn('id', $candidateIds)->get()->keyBy('id');

        $reviewItems = [];
        foreach ($positions as $pos) {
            $candidateId = $votesInput[$pos->id] ?? null;
            $selectedCandidate = $candidateId && isset($candidates[$candidateId])
                ? [
                    'id' => $candidates[$candidateId]->id,
                    'name' => $candidates[$candidateId]->name,
                    'party' => $candidates[$candidateId]->party,
                ]
                : null;

            $reviewItems[] = [
                'position_id' => $pos->id,
                'position_name' => $pos->name,
                'selected_candidate' => $selectedCandidate,
            ];
        }

        return Inertia::render('student/ReviewVote', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
            ],
            'review_items' => $reviewItems,
            'raw_votes' => $votesInput,
        ]);
    }

    /**
     * Submit votes securely via a database transaction.
     */
    public function submitVote(Request $request): RedirectResponse
    {
        $user = $request->user();
        $student = $this->getStudent($user);

        // 1. Check authentication & student profile
        if (! $user || ! $student) {
            return redirect()->route('login')->withErrors(['login' => 'Authentication required.']);
        }

        // 2. Check student eligibility
        if ($student->status !== 'active') {
            return redirect()->route('student.dashboard')->with('error', 'Your student account is not active.');
        }

        // 3 & 4. Check election status & whether open
        $electionId = $request->input('election_id');
        $election = Election::find($electionId);

        if (! $election || ! $election->isOpen()) {
            return redirect()->route('student.dashboard')->with('error', 'The election is not currently open for voting.');
        }

        // 5. Check if student has already voted
        if ($student->hasVotedIn($election)) {
            return redirect()->route('student.dashboard')->with('error', 'You have already cast your vote in this election.');
        }

        // 6. Validate selections
        $votesInput = $request->input('votes', []); // [position_id => candidate_id]
        if (empty($votesInput) || ! is_array($votesInput)) {
            return back()->with('error', 'No candidate selections received.');
        }

        $positions = Position::where('election_id', $election->id)->pluck('id')->toArray();

        // 7 & 8. Save votes in a DB Transaction
        try {
            DB::transaction(function () use ($election, $student, $votesInput, $positions) {
                // Double check inside transaction with lock to prevent race conditions
                $existingVoteCount = Vote::where('election_id', $election->id)
                    ->where('voter_id', $student->id)
                    ->lockForUpdate()
                    ->count();

                if ($existingVoteCount > 0) {
                    throw new \Exception('A vote has already been recorded for your student account.');
                }

                foreach ($votesInput as $posId => $candId) {
                    if (! $candId || ! in_array((int)$posId, $positions)) {
                        continue;
                    }

                    $candidate = Candidate::where('id', $candId)
                        ->where('position_id', $posId)
                        ->where('election_id', $election->id)
                        ->where('status', 'active')
                        ->first();

                    if (! $candidate) {
                        throw new \Exception("Invalid candidate selection for position ID: {$posId}");
                    }

                    Vote::create([
                        'election_id' => $election->id,
                        'position_id' => $posId,
                        'candidate_id' => $candidate->id,
                        'voter_id' => $student->id,
                    ]);
                }
            });
        } catch (\Throwable $e) {
            return redirect()->route('student.dashboard')->with('error', 'Voting submission failed: ' . $e->getMessage());
        }

        // 9 & 10. Display confirmation
        return redirect()->route('student.success')->with([
            'success' => 'Your vote has been securely recorded.',
            'election_title' => $election->title,
        ]);
    }

    /**
     * Show success confirmation page.
     */
    public function showSuccess(): Response
    {
        return Inertia::render('student/VoteSuccess', [
            'election_title' => session('election_title') ?? 'School Election 2026',
        ]);
    }
}
