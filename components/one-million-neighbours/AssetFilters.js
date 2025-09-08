export default function AssetFilters({ selectedAssets, onAssetToggle, assetTypes }) {
    const selectedAssetCount = Object.values(selectedAssets).filter(Boolean).length;

    return (
        <aside className="bg-white w-full md:w-80 flex flex-col h-auto md:h-full">
            <div className="flex-1 overflow-y-auto">
                <section className="p-4 md:p-6" aria-labelledby="assets-heading">
                    <div className="flex items-center justify-between mb-4">
                        <h2 id="assets-heading" className="text-sm font-semibold text-gray-900">
                            Rank neighbourhoods by:
                        </h2>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {selectedAssetCount} of {assetTypes.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {assetTypes.map(({ key, label }) => {
                            const isSelected = selectedAssets[key];
                            const isDisabled = selectedAssetCount === 1 && isSelected;
                            return (
                                <label key={key} className={`flex items-center p-3 border rounded-lg transition-all ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={isSelected} onChange={() => onAssetToggle(key)} disabled={isDisabled} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
                                </label>
                            );
                        })}
                    </div>
                </section>
            </div>
        </aside>
    );
}