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
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('elections')->cascadeOnDelete();
            $table->foreignId('position_id')->constrained('positions')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('name');
            $table->string('party');
            $table->string('photo')->nullable();
            $table->text('platform')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
