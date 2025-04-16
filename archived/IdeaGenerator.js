import styles from "styles/ideaGenerator.module.css"

import { useState, useEffect } from "react"
import Link from 'next/link'
import OutsideClickHandler from 'react-outside-click-handler';

import IdeaDisplay from "components/IdeaDisplay"
import TagFilter from "components/TagFilter"
import GeneratorButton from "archived/GeneratorButton"

function IdeaGenerator() {
  const [allIdeas, setAllIdeas] = useState([])
  const [availableIdeas, setAvailableIdeas] = useState([])
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [])

  useEffect(() => {
    filterIdeas()
  }, [selectedTags])

  const filterIdeas = () => {
    if (selectedTags.length < 1) {
      return setAvailableIdeas(allIdeas)
    }

    const filteredIdeas = allIdeas.filter(idea => {
      const ideaTags = idea.fields.Tags
      const matches = selectedTags.map(tag => ideaTags.includes(tag))

      // only allow ideas that match ALL the selected filters.
      // use .some() to keep the ideas that match ANY of the selected filters.
      return matches.every(m => m)
    })

    setAvailableIdeas(filteredIdeas)
  }

  const fetchIdeas = () => {
    // setLoading(true)
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        setAllIdeas(data.ideas)
        setAvailableIdeas(data.ideas)
        // setLoading(false)
      })
  }

  const reset = () => {
    setSelectedTags([])
  }

  const selectIdea = () => {
    setLoading(true)

    const timer = setTimeout(() => {
      const idea = availableIdeas[Math.floor(Math.random()*availableIdeas.length)];
      const remainingIdeas = availableIdeas.filter((item) => {
        return item.id !== idea.id
      })

      setSelectedIdea(idea)
      setLoading(false)

      if (remainingIdeas.length > 0) {
        setAvailableIdeas(remainingIdeas)
      } else {
        setAvailableIdeas(allIdeas)
        filterIdeas()
      }
    }, 300)
  }

  const toggleFilter = (tagName) => {
    const alreadySelected = selectedTags.includes(tagName)

    if (alreadySelected) {
      const filteredTags = selectedTags.filter(item => item != tagName)
      setSelectedTags(filteredTags)
    } else {
      const newTags = [...selectedTags, tagName]
      setSelectedTags(newTags)
    }
  }

  const openMenu = () => setMenuOpen(true)
  const closeMenu = () => setMenuOpen(false)
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const allOut = availableIdeas?.length === 0;

  return (
    <div id="idea-generator" className={`relative min-h-0 flex flex-col w-full h-full`}>
      <div className="flex-none flex justify-end mb-2 z-30">
        <button className="btn-white" onClick={toggleMenu} aria-label="Toggle menu">
          {
            menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="20" width="20">
                <path fill="var(--theme-black)" d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="20" width="20">
                <path fill="var(--theme-black)" d="M120 256c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm160 0c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm104 56c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56z"/>
              </svg>
            )
          }
        </button>
      {
        menuOpen &&
        <div className="absolute right-0 top-0 pr-11">
          <OutsideClickHandler onOutsideClick={closeMenu} useCapture={true}>
            <div className={`${styles.appear} flex flex-col border-3 bg-white p-5 rounded-xl`}>
              <Link href="/activities" className="mb-1">See all activities</Link>
              <Link href="/activities/new">Submit an activity idea</Link>
            </div>
          </OutsideClickHandler>
        </div>
      }
      </div>
      <div className="flex-auto flex relative min-h-0 z-10">
        <IdeaDisplay allOut={allOut} selectedIdea={selectedIdea} isLoading={isLoading} />
      </div>
      <div className="flex-none flex relative mb-2 z-20 py-2">
        <TagFilter
          toggleFilter={toggleFilter}
          selectedTags={selectedTags}
          reset={reset}
          appElementId="#idea-generator"
        />
        <GeneratorButton
          selectIdea={selectIdea}
          selectedIdea={selectedIdea}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default IdeaGenerator