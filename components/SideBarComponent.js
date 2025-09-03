import SidebarLayout from './SidebarLayout';
import AssetFilters from './AssetFilters';

export default function SidebarComponent({selectedAssets, handleAssetToggle, assetTypes}) {
    return (
        <SidebarLayout
            title="Title to describe these filters"
            subtitle="Subtitle to describe the calculations?"
        >
            <AssetFilters
                selectedAssets={selectedAssets}
                onAssetToggle={handleAssetToggle}
                assetTypes={assetTypes}
            />
        </SidebarLayout>
    );
}