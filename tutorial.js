import {AnnotationManager, SVGAnnotation} from './annotation.js'
import {AnimationManager} from './aniamtion.js'
import data_tutorial from './data/tutorial.json' with { type: 'json' };

/**
 * @param {AnnotationManager} AnnotationManager
 */
export class TutorialManager {
  isTutorial = false
  svg = null
  AnnotationManager = null
  tutorialIndex = -1
  tutorialCheckFinc = null

  /**
   * 
   * @param {*} svg 
   * @param {AnnotationManager} anMan 
   */
  constructor(svg, anMan, menuFolderFunc) {
    
    this.svg = svg 
    this.AnnotationManager = anMan

    this.menuFolderFunc = menuFolderFunc

    this.elCanvas = document.querySelector("#main-canvas")

    
    this.menuElement = document.querySelector(".root-menu")

    this.customEvent.bind(this)
  }
  start(){
    this.tutorialIndex = 0
    this.nowTutorial = JSON.parse(JSON.stringify(data_tutorial.tutorials[this.tutorialIndex]))

    const nowEvents = this.nowTutorial.toEvents.map((i) => JSON.parse(JSON.stringify(data_tutorial.events[i])))
    console.log(nowEvents)
    this.nowTutorial.events = nowEvents
    
    const _anno = this.nowTutorial.anno

    _anno.button = this.nowTutorial.events.findIndex((d) => d.type === "annotation click") != -1

    console.log(_anno)

    const svgAnno = this.AnnotationManager.add(_anno)

    window.addEventListener("tutorial", this.customEvent)

  }
  async next(newTutorialIndex){
    if(this.menuElement.classList.value.includes("tutorial-targeting")){
      this.menuElement.classList.remove("tutorial-targeting")
    }

    if(newTutorialIndex == null){
      console.log("次のチュートリアルを呼び出さない")
      return
    }

    if(data_tutorial.tutorials[newTutorialIndex] == undefined){
      console.log("tutorial fnish")
      
      window.removeEventListener("tutorial", this.customEvent)
      return 
    }

    this.tutorialIndex = newTutorialIndex

    this.nowTutorial = JSON.parse(JSON.stringify(data_tutorial.tutorials[this.tutorialIndex]))
    
    const nowEvents =  this.nowTutorial.toEvents.map((i) => JSON.parse(JSON.stringify(data_tutorial.events[i])))
    console.log(nowEvents)
    this.nowTutorial.events = nowEvents

    const _anno = this.nowTutorial.anno

    console.log({anno: this.nowTutorial.anno, events: this.nowTutorial.events})
    _anno.button = this.nowTutorial.events.findIndex((d) => d.type === "annotation click") != -1


    if(_anno.line !== undefined){
      const _a = document.querySelector(_anno.line.endElement)
      if(this.menuElement === _a.closest(".root-menu")){
        this.menuElement.classList.add("tutorial-targeting")
        await this.menuFolderFunc(_a)
      }
    }

    const svgAnno = this.AnnotationManager.add(_anno)

  }

  customEvent = (e) => {
    for(let i=0;i<this.nowTutorial.events.length;i++){
      const event = this.nowTutorial.events[i]

      if(e.detail.type !== event.type) continue

      if(event.type === "annotation click"){
        console.log(`customEvent annotation click`)

        this.AnnotationManager.remove(this.nowTutorial.anno.id)
        this.next(event.nextTutorialId)
      }
      else if(event.type === "user action"){
        if(event.name !== e.detail.name) return

        event.count -= 1

        if(event.count > 0) return

        this.AnnotationManager.remove(this.nowTutorial.anno.id)
        this.next(event.nextTutorialId)
      }
      else if(event.type === "function click"){
        if(event.name !== e.detail.name) return
        this.AnnotationManager.remove(this.nowTutorial.anno.id)
        this.next(event.nextTutorialId)
      }
    }
  }
}
