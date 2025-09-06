import json
import sys
from pathlib import Path


def filter_geojson():
    # File paths
    script_dir = Path(__file__).parent
    input_path = script_dir.parent / 'data' / 'fsa_2021_reprojected.geojson'
    output_path = script_dir.parent / 'data' / 'fsa_2021_waterloo.json'
    waterloo_region_fsa_codes = [
        "N1P",
        "N1R",
        "N1S",
        "N1T",
        "N2A",
        "N2B",
        "N2C",
        "N2E",
        "N2G",
        "N2H",
        "N2J",
        "N0B",
        "N2K",
        "N2L",
        "N2M",
        "N0G",
        "N2N",
        "N2P",
        "N2R",
        "N0K",
        "N2T",
        "N2V",
        "N3C",
        "N3E",
        "N3H",
    ]

    try:
        # Read the GeoJSON file
        with open(input_path, 'r', encoding='utf-8') as f:
            geojson = json.load(f)
        
        # Filter features where PRUID is "35" (Ontario)
        original_count = len(geojson['features'])
        filtered_features = [
            feature for feature in geojson['features'] 
            if feature['properties']['CFSAUID'] in waterloo_region_fsa_codes
        ]
        filtered_count = len(filtered_features)
        
        # Create new GeoJSON object with filtered features
        filtered_geojson = {
            'type': geojson['type'],
            'crs': geojson['crs'],
            'name': geojson['name'],
            'features': filtered_features
        }
        
        # Write the filtered data to a new file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(filtered_geojson, f, indent=2)
        
        print(f"Original features: {original_count}")
        print(f"Filtered features: {filtered_count}")
        print(f"Filtered data written to: {output_path}")
        
    except Exception as e:
        print(f"Error processing GeoJSON: {e}")
        sys.exit(1)

if __name__ == "__main__":
    filter_geojson() 