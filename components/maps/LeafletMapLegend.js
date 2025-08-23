const Legend = ({ categories }) => {
    if (!categories || categories.length === 0) return null
  
    return (
      <div className='leaflet-bottom leaflet-left'>
        <div className="leaflet-control leaflet-bar">
            <div className="legend bg-white p-2">
              <p className="font-semibold text-black mb-2">Legend</p>
              {categories.map((category, index) => (
                <div key={index} className="legend-item flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.color }} />
                  <div className="legend-item-label">{category.label}</div>
                </div>
              ))}
            </div>
        </div>
      </div>
    )
  }

  export default Legend