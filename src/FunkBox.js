import * as Tone from "tone"

class Sampler extends Tone.Sampler {
    constructor(sampleUrls, sampleBaseUrl) {
      super({
        urls: sampleUrls,
        baseUrl: sampleBaseUrl ? sampleBaseUrl : process.env.PUBLIC_URL,
      })
      this.eventCb = this.seqSampler
    }
    seqSampler(time) {
      this.drawSequence()
      this.instrument.triggerAttackRelease([24], "16n", time)
    }
  }

  class Sequence extends Tone.Sequence {
    static newSequence(eventCb, sequencePattern) {
      return new Sequence(eventCb, sequencePattern)
    }
    constructor(name, eventCb, sequencePattern, instrument, drawTarget) {
      super(eventCb, sequencePattern)
      this.instrument = instrument ? instrument : "No Sound"
      this.drawTarget = drawTarget ? drawTarget : ".blink-" + name
      this.drawClass = "seq-now"
      this.start(0)
    }
    drawSequence() {
      let channelLabel = document.querySelector(this.drawTarget)
      Tone.Transport.schedule((time) => {
        Tone.Draw.schedule(() => {
          channelLabel.classList.contains(this.drawClass)
            ? channelLabel.classList.add(this.drawClass + "-second")
            : channelLabel.classList.add(this.drawClass)
        }, time)
        Tone.Transport.schedule((time) => {
          Tone.Draw.schedule(() => {
            channelLabel.classList.remove(this.drawClass)
            channelLabel.classList.remove(this.drawClass + "-second")
          }, time)
        }, "+0.2")
      }, "+0.05")
    }
  }

  class instrumentChannel {
    constructor(instrument, name) {
      this.name = name ? name : ""
      this.instrument = this.setInstrument(instrument)
      this.sequencePattern = [[], [], [], [], [], [], [], []]
      this.sequence = new Sequence(
        this.name,
        this.instrument.eventCb,
        this.sequencePattern,
        this.instrument
      )
      this.drawTarget = ".blink-" + name
      this.drawClass = "seq-now"
    }
    setInstrument(instrument) {
        return new Sampler({
            24: "/Drums/asHihat01.wav",
        }).toDestination()
    }
    getInstrument() {
      return this.instrument
    }
    getEventCb() {
      return this.eventCb
    }
    changeStep = (step) => {
      let tempArr = this.sequence.events[step]
      let button = document.querySelector("." + this.name + step)
      switch (this.sequence.events[step].length) {
        case 0:
          tempArr = [["C1"]]
          button.innerText = "X"
          break
        case 1:
          tempArr = [["C1"], ["C1"]]
          button.innerText = "XX"
          break
        case 2:
            if (this.sequence.events[step][0][0]) {
                (tempArr = [[], ["C1"]])
                button.innerText = "0X"
            } else {
                (tempArr = [["C1"], ["C1"], ["C1"]])
                button.innerText = "XXX"
            }
          break
        case 3:
          if (this.sequence.events[step][0][0]) {
            tempArr = [[], ["C1"], ["C1"]]
            button.innerText = "OXX"
          } else if (this.sequence.events[step][1][0]) {
            tempArr = [[], [], ["C1"]]
            button.innerText = "OOX"
          } else {
            tempArr = []
            button.innerText = ""
          }
          break
        default:
          tempArr = []
          button.innerText = ""
          break
      }
      this.sequence.events[step] = tempArr
      // return till component => illustrera note, paus, triplet
    }
  }

  class mixerChannel {
    constructor(channelList) {
      this.mixerBus = {}
      this.setMixer(channelList)
      //this.sampleRecorder = new SampleRecorder("#Main-Screen")
      //this.canvas = new canvasAnimation("#Main-Screen")
    }
    setChannel(name, type) {
      this.mixerBus[name] = new instrumentChannel(type, name)
    }
    setMixer(channelList) {
      for (let channel of channelList) {
        this.setChannel(channel.name, channel.type)
      }
    }
    changeStep(channel, step) {
      if (this.mixerBus[channel]) {
        this.mixerBus[channel].changeStep(step)
      } else {
        console.log("There is no channel named " + channel)
      }
    }
  }

  let isSetup = null

let mixer = {}

export const channelList = [
  { name: "Kick", type: "Sampler" },
  { name: "Snare", type: "Sampler" },
  { name: "Hihat", type: "Sampler" },
  { name: "Shaker", type: "Sampler" }
]

// setup
const Setup = () => {
  mixer = new mixerChannel(channelList)
  changeBpm(60)
  Tone.Transport.start()
  isSetup = true
}

// exports

export const changeStep = (step, name) => {
  if (isSetup) {
    mixer.changeStep(name, step)
  }
  // return till component => illustrera note, paus, triplet
}

export const toggleLoop = () => {
  let StartStop = document.querySelector(".startSpan")
  isSetup ? Tone.Transport.toggle() : Setup()
  StartStop.innerHTML === "start"
    ? (StartStop.innerHTML = "stop")
    : (StartStop.innerHTML = "start")
}
export const stopLoop = () => {
  Tone.Transport.stop()
}


export const changeBpm = (change) => {
    change ? Tone.Transport.bpm.value += 1 : Tone.Transport.bpm.value -= 1
}
export const changeVolume = (change) => {
    console.log("volume " + change)
}