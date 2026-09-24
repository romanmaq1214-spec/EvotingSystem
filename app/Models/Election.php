<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function positions()
    {
        return $this->hasMany(Position::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'Open';
    }

    public function isClosed(): bool
    {
        return $this->status === 'Closed';
    }

    public function isDraft(): bool
    {
        return $this->status === 'Draft';
    }

    public function isUpcoming(): bool
    {
        return $this->status === 'Upcoming';
    }
}

