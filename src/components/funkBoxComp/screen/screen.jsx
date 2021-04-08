import React from "react"

export const Screen = ({ name }) => {
  return (
    <div className={name + "-Screen"}>
      <canvas id={name + "-Screen"} className={name + "-canvas"}></canvas>
    </div>
  )
}
