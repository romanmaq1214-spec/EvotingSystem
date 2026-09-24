<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Admin User
        User::updateOrCreate(
            ['email' => 'admin@evotingsystem.test'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'student_id' => null,
            ]
        );

        // 2. Create Sample Students
        $studentsData = [
            [
                'student_id' => '2026-0001',
                'first_name' => 'Juan',
                'middle_name' => 'Santos',
                'last_name' => 'Dela Cruz',
                'email' => 'juan.delacruz@school.edu',
                'course' => 'BS Information Technology',
                'year_level' => '3rd Year',
            ],
            [
                'student_id' => '2026-0002',
                'first_name' => 'Maria',
                'middle_name' => 'Clara',
                'last_name' => 'Santos',
                'email' => 'maria.santos@school.edu',
                'course' => 'BS Computer Science',
                'year_level' => '2nd Year',
            ],
            [
                'student_id' => '2026-0003',
                'first_name' => 'Carlos',
                'middle_name' => 'Perez',
                'last_name' => 'Reyes',
                'email' => 'carlos.reyes@school.edu',
                'course' => 'BS Business Administration',
                'year_level' => '4th Year',
            ],
            [
                'student_id' => '2026-0004',
                'first_name' => 'Alyssa',
                'middle_name' => 'Mae',
                'last_name' => 'Gonzales',
                'email' => 'alyssa.gonzales@school.edu',
                'course' => 'BS Hospitality Management',
                'year_level' => '1st Year',
            ],
            [
                'student_id' => '2026-0005',
                'first_name' => 'Mark',
                'middle_name' => 'Anthony',
                'last_name' => 'Bautista',
                'email' => 'mark.bautista@school.edu',
                'course' => 'BS Information Technology',
                'year_level' => '3rd Year',
            ],
        ];

        foreach ($studentsData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => trim("{$data['first_name']} {$data['last_name']}"),
                    'student_id' => $data['student_id'],
                    'password' => Hash::make('password'),
                    'role' => 'student',
                ]
            );

            Student::updateOrCreate(
                ['student_id' => $data['student_id']],
                [
                    'user_id' => $user->id,
                    'first_name' => $data['first_name'],
                    'middle_name' => $data['middle_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'course' => $data['course'],
                    'year_level' => $data['year_level'],
                    'status' => 'active',
                ]
            );
        }

        // 3. Create Sample Election: School Election 2026
        $election = Election::updateOrCreate(
            ['title' => 'School Election 2026'],
            [
                'description' => 'Annual Supreme Student Council General Election for Academic Year 2026-2027.',
                'start_date' => now()->subDay(),
                'end_date' => now()->addDays(7),
                'status' => 'Open',
            ]
        );

        // 4. Create Positions and Candidates
        $positionsData = [
            'President' => [
                'description' => 'Chief Executive of the Supreme Student Council',
                'candidates' => [
                    [
                        'name' => 'Alexander Vance',
                        'party' => 'Leaders of Tomorrow',
                        'platform' => 'Empowering students through transparent governance, enhanced campus Wi-Fi, and upgraded learning facilities.',
                    ],
                    [
                        'name' => 'Beatriz Ramos',
                        'party' => 'Progressive Youth Coalition',
                        'platform' => 'Advocating for student welfare funds, mental health resources, and green eco-friendly campus initiatives.',
                    ],
                    [
                        'name' => 'Christian Kyle Tan',
                        'party' => 'Independent Alliance',
                        'platform' => 'Bridging the gap between students and faculty through regular town halls and digital feedback channels.',
                    ],
                ],
            ],
            'Vice President' => [
                'description' => 'Assists the President and oversees committee operations',
                'candidates' => [
                    [
                        'name' => 'Diana Rose Mendoza',
                        'party' => 'Leaders of Tomorrow',
                        'platform' => 'Peer tutoring programs, academic symposiums, and inter-departmental collaborations.',
                    ],
                    [
                        'name' => 'Eduardo Gabriel Flores',
                        'party' => 'Progressive Youth Coalition',
                        'platform' => 'Career readiness seminars, internship fairs, and student business incubators.',
                    ],
                ],
            ],
            'Secretary' => [
                'description' => 'Custodian of records, communications, and official documentation',
                'candidates' => [
                    [
                        'name' => 'Fiona Garcia',
                        'party' => 'Leaders of Tomorrow',
                        'platform' => 'Timely publication of council minutes and an online transparency dashboard.',
                    ],
                    [
                        'name' => 'Gerald Ocampo',
                        'party' => 'Progressive Youth Coalition',
                        'platform' => '100% paperless student services and an automated document request portal.',
                    ],
                ],
            ],
            'Treasurer' => [
                'description' => 'Manages council finances, budgets, and disbursements',
                'candidates' => [
                    [
                        'name' => 'Hannah Nicole Lim',
                        'party' => 'Leaders of Tomorrow',
                        'platform' => 'Monthly financial breakdowns and itemized budget reports open for public viewing.',
                    ],
                    [
                        'name' => 'Ian Kristofer Diaz',
                        'party' => 'Progressive Youth Coalition',
                        'platform' => 'Equal budget subsidies for registered student clubs and emergency student assistance.',
                    ],
                ],
            ],
            'Auditor' => [
                'description' => 'Inspects financial records and ensures institutional accountability',
                'candidates' => [
                    [
                        'name' => 'Justin Keith Navarro',
                        'party' => 'Leaders of Tomorrow',
                        'platform' => 'Rigorous quarterly audits and open-door financial reviews.',
                    ],
                    [
                        'name' => 'Katrina Anne Soriano',
                        'party' => 'Progressive Youth Coalition',
                        'platform' => 'Strict accountability on project fund allocations and inventory verification.',
                    ],
                ],
            ],
            'PIO' => [
                'description' => 'Public Information Officer handling student announcements and media',
                'candidates' => [
                    [
                        'name' => 'Lance Oliver Castro',
                        'party' => 'Leaders of Tomorrow',
                        'platform' => 'Active campus social media announcements and real-time event updates.',
                    ],
                    [
                        'name' => 'Mia Cassandra Villanueva',
                        'party' => 'Progressive Youth Coalition',
                        'platform' => 'Student spotlight journalism, podcast series, and bulletin board revitalizations.',
                    ],
                ],
            ],
        ];

        foreach ($positionsData as $posName => $posDetails) {
            $position = Position::updateOrCreate(
                [
                    'election_id' => $election->id,
                    'name' => $posName,
                ],
                [
                    'description' => $posDetails['description'],
                    'max_votes' => 1,
                ]
            );

            foreach ($posDetails['candidates'] as $candidateData) {
                Candidate::updateOrCreate(
                    [
                        'election_id' => $election->id,
                        'position_id' => $position->id,
                        'name' => $candidateData['name'],
                    ],
                    [
                        'party' => $candidateData['party'],
                        'platform' => $candidateData['platform'],
                        'status' => 'active',
                    ]
                );
            }
        }
    }
}
