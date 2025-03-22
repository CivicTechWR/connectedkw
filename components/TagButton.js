export default function TagButton({ tag, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(tag)}
      className={`px-3 py-1 rounded-full text-sm 
        ${selected 
          ? 'bg-red border border-red text-white hover:bg-grey' 
          : 'bg-white border border-red text-black hover:bg-grey'
        }`}
    >
      {tag.name}
    </button>
  )
}