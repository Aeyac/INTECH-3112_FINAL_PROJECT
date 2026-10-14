export default function Pagination({ showing, total, label = 'results' }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 text-sm text-gray-500 md:px-6">
            <span>
                Showing{' '}
                <span className="font-semibold text-gray-700">{showing}</span> out
                of{' '}
                <span className="font-semibold text-gray-700">{total}</span>{' '}
                {label}
            </span>
        </div>
    );
}
