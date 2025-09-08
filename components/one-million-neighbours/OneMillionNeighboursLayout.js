export default function OneMillionNeighboursLayout({sidebar, children}) {
    return (
        <div className="h-full w-full bg-gray-50 flex flex-col md:flex-row shadow border border-slate-100">
            <div className="flex-shrink-0 md:flex-shrink">
                {sidebar}
            </div>
            <main className="flex-1 min-h-0 relative">{children}</main>
        </div>
    );
}