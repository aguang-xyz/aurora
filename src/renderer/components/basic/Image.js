import React, { useState } from 'react'
import ImagesViewer from 'react-images-viewer'

const Image = props => {
  const { alt, src } = props
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      />

      <ImagesViewer
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        imgs={[{ src, caption: alt }]}
        showImgCount={false}
      />
    </>
  )
}

export default Image
