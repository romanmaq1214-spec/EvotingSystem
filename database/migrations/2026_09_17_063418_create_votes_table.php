<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('elections')->cascadeOnDelete();
            $table->foreignId('position_id')->constrained('positions')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('candidates')->cascadeOnDelete();
            $table->foreignId('voter_id')->constrained('students')->cascadeOnDelete();
            $table->timestamps();

            // Prevent duplicate voting for the same position in an election
            $table->unique(['election_id', 'position_id', 'voter_id'], 'unique_vote_per_position');
            $table->index(['election_id', 'voter_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
