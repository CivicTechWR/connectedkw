import { useState, forwardRef } from 'react'
import { tagEmojiDict, eventCategories } from 'utils/constants'
import ReactModal from 'react-modal';


const OptionButton = forwardRef(function OptionButton(props, ref) {
  const { filter, option, toggleFn, isSelected } = props;
  
  const handleClick = () => {
    toggleFn(filter, option.id)
  }

  return (
    <button ref={ref} onClick={handleClick} className={`block text-sm px-2 py-1 m-1 ml-0 flex items-center hover:text-red`}>
      <span className={`h-3 w-3 inline-block border-2 border-black mr-1 ${isSelected ? 'bg-check-mark bg-contain bg-no-repeat bg-center' : 'bg-white'}`} />
      <span className="whitespace-nowrap">{option.name}</span>
    </button>
  )
})

const TagFilter = ({ filter, toggleFn, selectedOptions }) => {

  // const {refs, floatingStyles} = useFloating();

  const [activeFilterId, setActiveFilterId] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleFlagClick = (filter) => () => {
    toggleFn(filter)
  }


  if (filter.type === "boolean") {
    return (
      <button key={filter.id} onClick={handleFlagClick(filter)} className={`whitespace-nowrap relative block mb-2`}>
        {/*{(selectedOptions) && <span className="h-2 w-2 bg-red inline-block absolute -left-1" /> }*/}
        <span className={`${(selectedOptions) ? 'border-b-2 border-red' : 'border-none'}`}>{filter.label}</span>
        <i className={`ml-1 fa-solid fa-star text-yellow text-sm`}></i>
      </button>
    )
  }

  return (
    <>
      <button 
        key={filter.id} 
        type="button" 
        onClick={toggleDropdown}
        className={`whitespace-nowrap relative block mb-2`}
      >
        {/*{(selectedOptions.length > 0) && <span className="h-2 w-2 bg-red inline-block absolute -left-1" /> }*/}
        <span className={`${(selectedOptions.length > 0) ? 'border-b-2 border-red' : 'border-none'}`}>{filter.label}</span>
        <i className={`text-sm ml-1 fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
      </button>
      { isOpen &&
      <div>
        <div className={`${styles.appear}`}>
          {filter.options.map((option, index) => {
            const isSelected = selectedOptions.includes(option.id)
            return (
              <OptionButton 
                key={option.id} 
                filter={filter} 
                option={option} 
                isSelected={isSelected} 
                toggleFn={toggleFn} 
              />
            )
          })}
        </div>
      </div>
      }
    </>
  )
}

export default TagFilter
