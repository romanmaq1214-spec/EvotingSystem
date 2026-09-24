<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'password',
        'course',
        'year_level',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class, 'voter_id');
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} " . ($this->middle_name ? "{$this->middle_name} " : '') . "{$this->last_name}");
    }

    public function hasVotedIn(int|Election $election): bool
    {
        $electionId = $election instanceof Election ? $election->id : $election;

        return $this->votes()->where('election_id', $electionId)->exists();
    }
}

