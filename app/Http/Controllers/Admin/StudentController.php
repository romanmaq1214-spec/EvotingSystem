<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $students = Student::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('student_id', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('course', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/Students', [
            'students' => $students,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'string', 'max:100', 'unique:students,student_id', 'unique:users,student_id'],
            'username' => ['required', 'string', 'max:100', 'unique:students,email', 'unique:users,email'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:4'],
            'course' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:50'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $usernameInput = trim($validated['username']);

        DB::transaction(function () use ($validated, $usernameInput) {
            $user = User::create([
                'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                'email' => $usernameInput,
                'student_id' => $validated['student_id'],
                'password' => Hash::make($validated['password']),
                'role' => 'student',
            ]);

            Student::create([
                'user_id' => $user->id,
                'student_id' => $validated['student_id'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $usernameInput,
                'course' => $validated['course'],
                'year_level' => $validated['year_level'],
                'status' => $validated['status'],
            ]);
        });

        return redirect()->route('admin.students.index')->with('success', 'Student account created successfully. The student can now log in using their Username and Password.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'string', 'max:100', Rule::unique('students')->ignore($student->id), Rule::unique('users')->ignore($student->user_id)],
            'username' => ['required', 'string', 'max:100', Rule::unique('students', 'email')->ignore($student->id), Rule::unique('users', 'email')->ignore($student->user_id)],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'password' => ['nullable', 'string', 'min:4'],
            'course' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:50'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $usernameInput = trim($validated['username']);

        DB::transaction(function () use ($student, $validated, $usernameInput) {
            $student->update([
                'student_id' => $validated['student_id'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $usernameInput,
                'course' => $validated['course'],
                'year_level' => $validated['year_level'],
                'status' => $validated['status'],
            ]);

            if ($student->user) {
                $userUpdate = [
                    'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                    'email' => $usernameInput,
                    'student_id' => $validated['student_id'],
                ];
                if (! empty($validated['password'])) {
                    $userUpdate['password'] = Hash::make($validated['password']);
                }
                $student->user->update($userUpdate);
            }
        });

        return redirect()->route('admin.students.index')->with('success', 'Student account updated successfully.');
    }

    public function toggleStatus(Student $student): RedirectResponse
    {
        $newStatus = $student->status === 'active' ? 'inactive' : 'active';
        $student->update(['status' => $newStatus]);

        return back()->with('success', "Student account is now {$newStatus}.");
    }

    public function destroy(Student $student): RedirectResponse
    {
        DB::transaction(function () use ($student) {
            if ($student->user) {
                $student->user->delete();
            }
            $student->delete();
        });

        return redirect()->route('admin.students.index')->with('success', 'Student account deleted successfully.');
    }
}
