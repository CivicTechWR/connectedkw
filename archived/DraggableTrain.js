import styles from 'styles/navbar.module.css'
import Link from 'next/link'
import Image from 'next/image'
import {useRouter} from 'next/router'
import {DndContext, useDroppable, useDraggable} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState, useEffect, useRef, forwardRef } from 'react'
import { useCookies } from 'react-cookie';
import { Tooltip } from 'react-tooltip'


const COOKIE_MAXAGE = 2147483647;
const COOKIE_NAME = 'train-nav-has-been-dragged';

const DraggableTrain = ({ imagePath, coordinates }) => {
  const [show, setShow] = useState(false)
  const [ cookies, setCookie ] = useCookies([COOKIE_NAME]);

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'draggable-train',
  });

  const left = coordinates ? coordinates.x  : 0;
  const top = coordinates ? coordinates.y  : 0;

  const style = {
    position: 'absolute',
    left: `${(left - 35)}px`,
    top: `${top + 2}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  useEffect(() => {
    const hasBeenDragged = cookies[COOKIE_NAME] === 'true'
    if (!hasBeenDragged) {
      setShow(true)
    }
  })

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes} className={`${styles.trainBtn} absolute`}>
      <img src={imagePath} alt="" className={styles.navButton} data-tooltip-id="train-tooltip" data-tooltip-content="Move me!" />
      <Tooltip 
        id="train-tooltip" 
        isOpen={show}
        variant="light"
        className={styles.trainTooltip}
        place="bottom-start"
        offset={4}
      />
    </button>
  );
}

export default DraggableTrain;

