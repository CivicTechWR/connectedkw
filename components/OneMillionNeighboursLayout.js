export default function OneMillionNeighboursLayout({sidebar, children}) {
    return (
        <div className="h-screen bg-gray-50 flex">
            {sidebar}
            <main className="flex-1 relative">{children}</main>
        </div>
    );

};