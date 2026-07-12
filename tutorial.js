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
    this.nowTutorial = null

    this.data_tutorial = data_tutorial
    
    this.menuElement = document.querySelector(".root-menu")

    this.customEvent.bind(this)

    this.onResize.bind(this)
    window.addEventListener("resize", this.onResize)

    
    window.addEventListener("tutorial", this.customEvent)
  }
  async next(newTutorialIndex, newset){
    if(newset && this.nowTutorial !== null){
      this.AnnotationManager.remove(this.nowTutorial.anno.id)
    }
    
    if(this.menuElement.classList.value.includes("tutorial-targeting")){
      this.menuElement.classList.remove("tutorial-targeting")
    }

    if(newTutorialIndex == null){
      console.log("次のチュートリアルを呼び出さない")
      return
    }

    if(data_tutorial.tutorials[newTutorialIndex] == undefined){
      console.log(`tutorial fnish newTutorialIndex: ${newTutorialIndex}`)
      
      // window.removeEventListener("tutorial", this.customEvent)
      this.nowTutorial = null
      return 
    }

    this.tutorialIndex = newTutorialIndex

    this.nowTutorial = JSON.parse(JSON.stringify(data_tutorial.tutorials[this.tutorialIndex]))
    
    const nowEvents =  this.nowTutorial.toEvents.map((i) => JSON.parse(JSON.stringify(data_tutorial.events[i])))
    // console.log(nowEvents)
    this.nowTutorial.events = nowEvents

    const _anno = this.nowTutorial.anno

    const _annoId = nowEvents.findIndex((d) => d.type === "annotation click")
    // console.log({_annoId, nowEvents_text: nowEvents})
    _anno.button = false
    if(_annoId != -1){
      // console.log({nowEvents_text: nowEvents[_annoId].text})
      _anno.button = true
      _anno.button_text = nowEvents[_annoId].text || "OK"
    }

    if(_anno.line !== undefined){
      const _a = document.querySelector(_anno.line.endElement)
      
      if(_anno.line.notObstructview !== undefined && _anno.line.notObstructview){
        this.menuElement.classList.add("clause-folder")
      }
      else if(this.menuElement === _a.closest(".root-menu")){
        this.menuElement.classList.add("tutorial-targeting")
        await this.menuFolderFunc(_a)
      }
    }

    const svgAnno = this.AnnotationManager.add(_anno)

  }

  customEvent = (e) => {
    if(this.nowTutorial === null){
      return
    }

    for(let i=0;i<this.nowTutorial.events.length;i++){
      const event = this.nowTutorial.events[i]

      if(e.detail.type !== event.type) continue

      if(event.type === "annotation click"){
        this.AnnotationManager.remove(this.nowTutorial.anno.id)
        this.next(event.nextTutorialId)

        return
      }
      else if(event.type === "user action"){
        if(event.name !== e.detail.name) continue

        event.count -= 1
        if(event.count > 0) continue

        this.AnnotationManager.remove(this.nowTutorial.anno.id)
        this.next(event.nextTutorialId)

        return
      }
      else if(event.type === "function click"){
        if(event.name !== e.detail.name) continue
        this.AnnotationManager.remove(this.nowTutorial.anno.id)
        this.next(event.nextTutorialId)

        return
      }
    }
  }
  onResize(e) {
    // console.log("onResize")
    const svg = document.querySelector("#annotation-svg")

    svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`)

  }
}
