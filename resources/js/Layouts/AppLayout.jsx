import { useState } from 'react';
import FlashToasts from '../Components/FlashToasts';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';

export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-gray-100 font-sans text-gray-800 antialiased md:flex-row">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            </div>

            <FlashToasts />
        </div>
    );
}
