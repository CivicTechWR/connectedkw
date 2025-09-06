export default function OneMillionNeighboursLayout({sidebar, children}) {
    return (
        <div className="h-[75vh] bg-gray-50 flex shadow border border-slate-100">
            {sidebar}
            <main className="flex-1 relative">{children}</main>
        </div>
    );

};