import { eventCategories, tagEmojiDict } from "../utils/constants"
import Image from 'next/image'

const FeatureCard = ({ feature, setSelectedFeature }) => {
  if (!feature) return null

  const image = feature.Images ? feature.Images[0] : null
  const imgSrc = image?.thumbnails?.large?.url
  const imageDescription = feature["Image description"]
  const title = feature.Title || "Untitled"
  const artist = feature.Artist || "Artist unknown"
  const date = feature.Year
  const locationName = feature["Location description"]
  const address = feature["Street address"]
  const city = feature.City
  const description = feature.Description
  const link = feature["External link"]
  const linkText = feature["Link text"] || "More information"
  const imageCredit = feature["Image credit"]
  const category = feature.Category
  const categoryStyles = eventCategories[category]

  const fullAddress = [address, city].filter(i=>i).join(", ")
  const artistInfo = [artist, date].filter(i=>i).join(", ")

  return (
      <button onClick={() => setSelectedFeature(feature)} className={`snap-start transition-all relative p-0 items-start flex-col w-full bg-white border-3 rounded-xl border-black overflow-hidden mb-1`}>
        <div className={`flex w-full h-full min-h-0`}>
        { imgSrc &&
          <div className={`aspect-square basis-1/3 flex-none overflow-hidden`}>
            <Image
              className={`object-cover w-full h-full min-[500px]:max-md:aspect-square`}
              src={imgSrc}
              alt={imageDescription}
              width={image ? image.thumbnails.large.width : 150}
              height={image ? image.thumbnails.large.height : 150}
            />
          </div>
        }
          <div className={`basis-2/3 flex-auto text-left overflow-auto h-full styled-scrollbar p-3`}>
            <h3 className="text-sm mb-1 font-body font-medium">{title}</h3>
            <p className="text-xs mb-1">{artistInfo}</p>
            <p className="text-xs mb-1">{locationName ? locationName : fullAddress}</p>
          </div>
        </div>
      </button>
  )
}

const FeatureList = ({ features, categories, setSelectedFeature }) => {
  return(
    <div>
      { features.map(feature => <FeatureCard key={feature.id} feature={feature} setSelectedFeature={setSelectedFeature} />) }
    </div>
  )
}

export default FeatureList