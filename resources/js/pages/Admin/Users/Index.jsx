import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import PageHeader from '../../../Components/PageHeader';
import ToggleTabs from '../../../Components/ToggleTabs';
import RolesTab from './Tabs/RolesTab';
import UsersTab from './Tabs/UsersTab';

export default function UsersIndex(props) {
    const [tab, setTab] = useState('users');

    return (
        <AppLayout>
            <Head title="User Management" />

            <PageHeader
                title="User Management"
                subtitle="Manage staff accounts, role assignments, and permissions"
            >
                <ToggleTabs
                    options={[
                        { value: 'users', label: 'Users' },
                        {
                            value: 'roles',
                            label: 'Roles & Permissions',
                        },
                    ]}
                    value={tab}
                    onChange={setTab}
                />
            </PageHeader>

            {tab === 'users' ? (
                <UsersTab {...props} />
            ) : (
                <RolesTab {...props} />
            )}
        </AppLayout>
    );
}