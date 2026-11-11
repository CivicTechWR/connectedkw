const FsaPopup = ({ feature, totalFSAs=24 }) => {
    return (
      <div>
        <h3 className="font-semibold">{feature.properties.GEO_DISPLAY_NAME} ({feature.properties.CFSAUID})</h3>
        <div className="text-sm">
          <div className="flex justify-between gap-4 border-b py-1">
            <div>Population</div>
            <div>{feature.properties.Population.toLocaleString()}</div>
          </div>
          
          <div className="flex justify-between gap-4 border-b py-1">
            <div>Overall rank</div>
            <div>{`${feature.properties.combined_rank}/${totalFSAs}`}</div>
          </div>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Community Centres</div>
            <div>{feature.properties.community_centre}</div>
          </div>
          
          <div className="flex justify-between gap-4 border-b py-1">
            <div>Pools</div>
            <div>{feature.properties.pool}</div>
          </div>
                    
          <div className="flex justify-between gap-4 border-b py-1">
            <div>Parks & Green Spaces</div>
            <div>{feature.properties.park}</div>
          </div>
          
          <div className="flex justify-between gap-4 border-b py-1">
            <div>Trails & Paths</div>
            <div>{feature.properties.trail}</div>
          </div>
        </div>
      </div>
    )
  }

  export default FsaPopup