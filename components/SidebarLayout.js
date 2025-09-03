export default function SidebarLayout({ title, subtitle, children }) {
    return (
        <aside className="bg-white w-80 border-r border-gray-200 shadow-sm flex flex-col h-full">
            <header className="p-6 border-b border-gray-200 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </header>

            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </aside>
    );
}