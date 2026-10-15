<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionController extends Controller
{
    /**
     * Bulk-update which permissions the editable roles (Manager/Staff) hold.
     * The Admin role is always granted every permission and cannot be locked
     * out through this endpoint.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['array'],
            'permissions.*.*' => ['string'],
        ]);

        $known = RolesAndPermissionsSeeder::PERMISSIONS;

        foreach (array_keys($validated['permissions']) as $name) {
            abort_unless(in_array($name, $known, true), 422, "Unknown permission [{$name}].");
        }

        $manager = Role::firstOrCreate(['name' => 'Manager']);
        $staff = Role::firstOrCreate(['name' => 'Staff']);

        DB::transaction(function () use ($validated, $manager, $staff) {
            $permissions = $validated['permissions'];

            $manager->syncPermissions($this->grantedPermissions($permissions, 'Manager'));
            $staff->syncPermissions($this->grantedPermissions($permissions, 'Staff'));

            $admin = Role::firstOrCreate(['name' => 'Admin']);
            $admin->syncPermissions(RolesAndPermissionsSeeder::PERMISSIONS);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return back()->with('success', 'Role permissions updated successfully.');
    }

    /**
     * Permission names granted to a given role by the submitted matrix.
     *
     * @param  array<string, list<string>>  $permissions
     * @return list<string>
     */
    private function grantedPermissions(array $permissions, string $role): array
    {
        return array_keys(
            array_filter($permissions, fn(array $roles) => in_array($role, $roles, true))
        );
    }
}