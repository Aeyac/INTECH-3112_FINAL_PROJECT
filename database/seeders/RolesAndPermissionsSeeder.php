<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Granular capabilities used across the modular route files.
     *
     * @var list<string>
     */
    public const PERMISSIONS = [
        'view-dashboard',
        'view-categories',
        'manage-categories',
        'view-suppliers',
        'manage-suppliers',
        'view-items',
        'manage-items',
        'view-purchases',
        'manage-purchases',
        'view-sales',
        'record-sales',
        'view-ledger',
        'adjust-stock',
        'manage-users',
    ];

    /**
     * Human-facing permission catalog grouped by module, used to render the
     * Roles & Permissions editor. Keys of every entry must stay in
     * PERMISSIONS.
     *
     * @var array<string, array<string, string>>
     */
    public const MODULES = [
        'Dashboard' => [
            'view-dashboard' => 'View the dashboard',
        ],
        'Categories' => [
            'view-categories' => 'View categories',
            'manage-categories' => 'Add, edit & archive categories',
        ],
        'Suppliers' => [
            'view-suppliers' => 'View suppliers',
            'manage-suppliers' => 'Add, edit & archive suppliers',
        ],
        'Items' => [
            'view-items' => 'View items & inventory',
            'manage-items' => 'Add, edit & archive items',
        ],
        'Purchases' => [
            'view-purchases' => 'View purchases',
            'manage-purchases' => 'Record purchases',
        ],
        'Sales' => [
            'view-sales' => 'View sales',
            'record-sales' => 'Record sales',
        ],
        'Stock Ledger' => [
            'view-ledger' => 'View the stock ledger',
            'adjust-stock' => 'Post stock adjustments',
        ],
        'User Management' => [
            'manage-users' => 'Manage user accounts & roles',
        ],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Admin: every capability.
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $admin->syncPermissions(self::PERMISSIONS);

        // Manager: everything except user administration.
        $manager = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $manager->syncPermissions(array_values(array_diff(self::PERMISSIONS, ['manage-users'])));

        // Staff: read access + sales recording + stock adjustments.
        $staff = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        $staff->syncPermissions([
            'view-dashboard',
            'view-categories',
            'view-suppliers',
            'view-items',
            'view-sales',
            'record-sales',
            'view-ledger',
            'adjust-stock',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
