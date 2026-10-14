import FlashToasts from "../Components/FlashToasts";

export default function AuthLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-slate-50 font-sans text-slate-900 antialiased">
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                <div className="h-[500px] w-[500px] rounded-full bg-slate-200/50 blur-3xl" />
                <svg
                    className="absolute inset-0 h-full w-full opacity-[0.3]"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="grid-pattern"
                            width="32"
                            height="32"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="2" cy="2" r="1" fill="#94a3b8" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>

            <header className="w-full border-b border-slate-200/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 sm:py-5">
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        SmartStock
                    </span>
                </div>
            </header>

            <main className="flex w-full flex-1 items-center justify-center p-4 py-8">
                {children}
            </main>

            <footer className="w-full border-t border-slate-200/80">
                <div className="mx-auto flex max-w-7xl items-center justify-start gap-6 px-6 py-5 text-xs text-slate-500 sm:px-8 sm:py-6">
                    <span>&copy; SmartStock</span>
                    <span className="transition-colors hover:text-slate-900">
                        Privacy &amp; terms
                    </span>
                </div>
            </footer>

            <FlashToasts />
        </div>
    );
}
