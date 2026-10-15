<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display the requester's own account plus every account they created.
     */
    public function index(Request $request): Response
    {
        $admin = $request->user();

        $users = User::query()
            ->with('roles')
            ->where(fn($query) => $query->where('owner_id', $admin->id)->orWhere('id', $admin->id))
            ->orderBy('name')
            ->get()
            ->map(fn(User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
                'permission_count' => $user->getAllPermissions()->count(),
            ]);

        $roles = Role::query()
            ->orderBy('name')
            ->with('permissions')
            ->get()
            ->keyBy('name');

        $permissionMatrix = collect(RolesAndPermissionsSeeder::MODULES)
            ->map(function (array $permissions, string $module) use ($roles) {
                return [
                    'module' => $module,
                    'permissions' => collect($permissions)
                        ->map(function (string $label, string $name) use ($roles) {
                            return [
                                'name' => $name,
                                'label' => $label,
                                'roles' => $roles
                                    ->filter(fn(Role $role) => $role->permissions->contains('name', $name))
                                    ->keys()
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => ['Staff', 'Manager'],
            'permissionMatrix' => $permissionMatrix,
        ]);
    }

    /**
     * Create a new Staff or Manager account within the requester's workspace.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', Password::min(8)],
            'role' => ['required', 'string', Rule::in(['Staff', 'Manager'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'owner_id' => $request->user()->id,
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Update an existing user account.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::min(8)],
            'role' => ['required', 'string', Rule::in(['Staff', 'Manager', 'Admin'])],
        ]);

        $currentRole = $user->getRoleNames()->first() ?? '';

        if ($request->user()->is($user) && $validated['role'] !== $currentRole) {
            abort(403, 'You cannot change your own role.');
        }

        if ($user->hasRole('Admin')) {
            abort_if(
                $validated['role'] !== 'Admin',
                403,
                'Admin roles can only be granted through registration.'
            );
        } elseif ($validated['role'] === 'Admin') {
            abort(
                403,
                'Admin roles can only be granted through registration.'
            );
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => $validated['password']]);
        }

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Delete a user account.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->id === $user->id, 403, 'You cannot delete your own account.');

        if ($user->hasRole('Admin')) {
            abort(403, 'Admin accounts cannot be deleted from within the app.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}