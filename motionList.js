
import {
  State, cubeState, set_color_data, color_set,
  cube_Full_Animation_Make, cubesetData, cubeset, wait,
  objectPrint, positionGet
} from './solve.js'

import { meter } from './meter.js'
import {Animation} from './aniamtion.js'

export class motionList{
  full_cube = null
  model_centers = null
  model_corners = null
  model_edges = null
  bone_centers = null
  bone_corners = null
  bone_edges = null
  L_hand = null
  R_hand = null
  frameObj = null

  mew_motion = null
  animation_start_time = null
  meterData = null

  // meterBar = document.querySelector('.time-meter-animation')

  step_time_meter = null
  mode_direction = null
  rotImgs = null
  step_move = null

  outLineModule = null

  step_move = null
  imgAnimData = null
  imgAnims = []
  // boneNumber = null

  constructor({
    full_cube = null, 
    L_hand = null, R_hand = null, frameObj = null, parent = null
  } = {}  ){
    // console.log({model_centers, bone_centers})

    this.full_cube = full_cube
    this.L_hand = L_hand
    this.R_hand = R_hand
    this.frameObj = frameObj
    this.parent = parent

    this.mew_motion = true
    this.animation_start_time = undefined
    
    this.meterData = {
      area: document.querySelector(`.step-meter .meter-out`),
      bar: document.querySelector(`.step-meter .meter-out .meter-in`)
    }

    this.scene = document.querySelector("a-scene")

    // this.meterBar = document.querySelector('.time-meter-animation')

    this.step_time_meter = null
    this.mode_direction = undefined

    this.rotImgs = undefined

    this.step_move = undefined

    this.back_btn_func = this.back_btn_func.bind(this)
    this.next_btn_func = this.next_btn_func.bind(this)
    this.stop_btn_func = this.stop_btn_func.bind(this)
    this.play_btn_func = this.play_btn_func.bind(this)
    this.reverse_btn_func = this.reverse_btn_func.bind(this)
    this.learning_btn_func = this.learning_btn_func.bind(this)
    this.stepList_func = this.stepList_func.bind(this)
    this.execution_btn_func = this.execution_btn_func.bind(this)
    this.stepAnimationEnd = this.stepAnimationEnd.bind(this)

    this.back_btn = document.querySelector('.back-div')
    this.next_btn = document.querySelector('.next-div')
    this.reverse_btn = document.querySelector('.reverse-div')
    this.play_btn = document.querySelector('.play-div')
    this.stop_btn = document.querySelector('.stop-div')
    this.stepList = document.querySelector(`.step-lists`)
    this.learning_btn = document.querySelector(`.learning-div`)
    this.execution_btn = document.querySelector('.execution-div')
    
    this.next_btn.addEventListener("click", this.next_btn_func)
    this.back_btn.addEventListener("click", this.back_btn_func)
    this.stop_btn.addEventListener("click", this.stop_btn_func)
    this.play_btn.addEventListener("click", this.play_btn_func)
    this.reverse_btn.addEventListener("click", this.reverse_btn_func)
    this.execution_btn.addEventListener("click", this.execution_btn_func)
    this.learning_btn.addEventListener("click", this.learning_btn_func)
    this.stepList.addEventListener("click", this.stepList_func)

    this.parent.cubeAnim.mixer.addEventListener('finished', this.stepAnimationEnd)
  }
  async ins(_Datas, _color_data, _Rotes, _RotPatterns, animData){
    this.setData = new State(_Datas)
    
    const _data = Object.keys(animData.data)
    _data.forEach((e, i)=>{
      this[e] = animData.data[e]
    })

    this.animations = {
      L_hand: "L_hand",
      R_hand: "R_hand",
      cube: "full_cube",
    }
    this.imgAnimData = animData.anim.img
    console.log(animData.anim)

    Object.keys(this.animations).forEach((e) => {
      this.animations[e] = Animation.makeAnimation(animData.anim[this.animations[e]])
    })

    this.stepGroupAnimCheck = Array.from({ length: this.groupRotesCube.length }, () => false)

    const imgW = Math.ceil(Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight)*0.07)

    const rotas = document.getElementsByClassName('rotas')
  
    const imgDiv = document.createElement('div')
    imgDiv.classList.add("img-div")
    imgDiv.style.width = imgW
    imgDiv.style.height = imgW

    const img = document.createElement('img')
    img.classList.add('rotate-img')

    const line = document.getElementsByClassName('line')[0]
    const lineCount = parseInt(line.clientWidth / imgW)

    const _name = document.createElement("p")

    const step = [
      [
        // [
          // "U","U'","U2",
          // "R","R'","R2",
          // "L","L'","L2",
          // "y R2 y'","F2",
        // ],
        [
          // "F","F'","F2",
          // "U' R' F",
          "U' R' F","R' F R",
        ],
      ],
      [
        // [
          // "y","y'","y2",
          // "U","U'","U2",
          // "R U R'",
        // ],
        [
          "R U R'",
          "U R U' R'",
          "R U' R'",
          "R U2 R' U' R U R'",
        ],
      ],
      [
        // [
          // "y","y'","y2",
          // "U","U'","U2",
          // "R U' R' F R' F' R",
        // ],
        [
          "R' F' R U R U' R' F",
          "R U' R' F R' F' R",
          "U' R' F' R U R U' R' F",
          "U R U' R' F R' F' R",
        ],
      ],
      [
        [
          // "U",
          // "U'",
          // "U2",
          "F R U R' U' F'",
          // "F R' F' R U R U' R'",
        ],
      ],
      [
        [
          // "U",
          // "U'",
          // "U2",
          "R U R' U R U2 R'",
          // "F R' F' R U R U' R'",
        ],
      ],
      [
        [
          // "U",
          // "U'",
          // "U2",
          "R U' R U R U R U' R' U' R2",
          // "F R' F' R U R U' R'",
        ],
      ],
      [
        [
          "x' U2 R2 U' L' U R2 U' L U' x",
          // "F R' F' R U R U' R'",
        ],
      ]
    ]

    // console.log(_RotPatterns)
    const Pattern = _RotPatterns
    for(let i=0;i<Pattern.length;i++){
      rotas[i].innerHTML = ''
      if(Pattern[i].length == 0){
        const D = imgDiv.cloneNode(), I=img.cloneNode()
        // D.classList.remove("img-div")
        I.src=`./img/skip.png`
        I.style.width = `${3 * imgW}px`
        rotas[i].parentElement.style.height = `${imgW}px`
        // D.append(I)
        rotas[i].append(I)
        continue
      }
      let len = 0
      for(let s=0;s<Pattern[i].length;s++){
        if(Pattern[i][s].length>2){
          len += 1
          const D = imgDiv.cloneNode(), I=img.cloneNode()
          D.classList.remove("img-div")
          D.classList.add("frame-div")
          I.src=`./img/(.png`
          D.append(I)
          
          const PatternName = _name.cloneNode()
          let hit = undefined

          step.forEach((_n, I) => {
            _n[0].forEach((n, J) => {
              if(Pattern[i][s] == n){
                hit = [I, J]
              }
            })         
          })

          if(hit != undefined){
            PatternName.textContent = `${"ABCDEFG"[hit[0]]}${hit[1]+1}`
            D.append(PatternName)
          }
          rotas[i].append(D)
        }
        for(let j of Pattern[i][s].split(" ")){
          len += 1
          const D = imgDiv.cloneNode(true), I=img.cloneNode()
          I.src=`./img/${j}.png`
          D.append(I)
          rotas[i].append(D)
        }
        if(Pattern[i][s].length>2){
          len += 1
          const D = imgDiv.cloneNode(), I=img.cloneNode()
          D.classList.remove("img-div")
          I.src=`./img/).png`
          D.append(I)
          rotas[i].append(D)
        }
      }      
      // console.log(`sum_solution [${sum_solution[i].length}]  lineCount [${lineCount}]`)
      rotas[i].style.width = `${Math.min(len, lineCount) * imgW}px`
      rotas[i].parentElement.style.height = `${Math.ceil(len / lineCount) * imgW}px`

    }
    // this.rotImgs = document.querySelectorAll(".ima-div-back")
    // this.rotImgs = document.querySelectorAll(".rotate-img")
    this.rotImgs = document.querySelectorAll(".img-div")
    
    // this.full_cube.addEventListener("animation-finished", this.stepAnimationEnd)

    await wait(100)

    this.stepCount = 0
    this.stopTime = 0
    this.step_move = false

    await this.stepChange(this.stepCount)

    console.log("セットアップ 完了")

    return 
  }
  async rotImageAnimation2(group){
    if(this.stepGroupAnimCheck[group]){
      return
    }
    this.stepGroupAnimCheck[group] = true

    const anim = this.imgAnimData
    let text =``

    for(let s=this.groupRotesCube[group];s<this.groupRotesCube[group+1];s++){
    // for(let s=this.groupRotesCube[i];s<this.groupRotesCube[i]+1;s++){
      const toWRote = this.towRotes.indexOf(s)

      let max = this.towRotes.filter((a) => a<s)
      let imgId = s - max.length
      const img = this.rotImgs[imgId]

      text += ` s:${s} T:${toWRote} I:${imgId}\n`

      text += `${
        JSON.stringify(anim).split(",").join(",\n")
            .split("{").join("{\n")
      }\n\n`

      // console.log({img,animation,text})
      await img.animate(anim[imgId].key, anim[imgId].move)
      .ready.then((et) => {
        this.imgAnims[imgId] = et
        et.pause()
        et.currentTime=0
      }).catch((error) => {
      // console.log(error)
      })
      
    }
    text += `\n`
    // console.log(text)
    return 
  }
  async rotImageAnimation(anim){

    let text =``

    for(let i=0;i<this.groupRotesCube.length;i++){

      text += `step ${i}\n`
      text += `set \n`
      // ${
      //   JSON.stringify(animation).split(",").join(",\n")
      //       .split("{").join("{\n")
      // }


      for(let s=this.groupRotesCube[i];s<this.groupRotesCube[i+1];s++){
      // for(let s=this.groupRotesCube[i];s<this.groupRotesCube[i]+1;s++){
        const toWRote = this.towRotes.indexOf(s)

        let max = this.towRotes.filter((a) => a<s)
        let imgId = s - max.length
        const img = this.rotImgs[imgId]

        text += ` s:${s} T:${toWRote} I:${imgId}\n`

        text += `${
          JSON.stringify(anim).split(",").join(",\n")
              .split("{").join("{\n")
        }\n\n`

        // console.log({img,animation,text})
        await img.animate(anim[imgId].key, anim[imgId].move)
        .ready.then((et) => {
          this.imgAnims[imgId] = et
          et.pause()
          et.currentTime=0
        }).catch((error) => {
       // console.log(error)
        })
        
      }
      text += `\n`
    }
    // console.log(text)
    return 
  }
  learningState(){
    // dispCube.cube
    // this.stepCount
    
    dispCube.cube = animCube.cube
  }
  async stepChange(newStep){
 // console.log({newStep})

    if(newStep == 16){
      // console.log("rote_re_start finish")
      return {skip: true, check: "over"}
    } 
    // console.log("next_btn")
    this.stepCount = newStep

    this.step_scroll(this.stepCount)
    // this.meterBar.style.maxWidth = "0%"
    
    const index = this.stepSkip[this.stepCount]

    // console.log({index})

    if(index == -1){
      const _index = this.stepSkip.slice(this.stepCount).find((e)=>e>-1)
      if(_index == undefined)  this.frame(this.stepStartTime.at(-1)/1000)
      else  this.frame(this.stepStartTime[_index]/1000)

      this.frameObjSet(this.stepCount)
      this.learning_btn.style.display = "none"
      // console.log(`rote_re_start skip newId:${_index}`)
      return {skip: true, }
    }

    await this.rotImageAnimation2(index)

    this.stepAnimationPause(index)
    this.stepAnimationPointSet(index, 0)

    // console.log(`point 1`)

    
    // this.parent.cubeAnim.remove()
    // cubeset(this.parent.ObjectManager.objects.cube, this.parent.dispCube.cube)
    // this.parent.cubeAnim.set({animationData: anims, fps: 1, timeScale: rotaSpped})
    // this.parent.cubeAnim.action.paused = false

    this.stepRmoveAnim()
    this.stepMakeAnim(this.stepStartTime[index]/1000, this.stepStartTime[index+1]/1000)

    this.stopTime = 0

    // console.log(`point 2`)

    this.meter_set(index)
    this.frameObjSet(this.stepCount)
    
    this.learning_btn.style.display = "block"
  }
  stepRmoveAnim(){
		this.parent.cubeAnim.remove()
		this.parent.handLAnim.remove()
		this.parent.handRAnim.remove()
  }
  stepMakeAnim(timeStart, timeEnd){
    const check = [
      this.parent.cubeAnim.sliceSet({
        animationData: this.animations.cube,
        fps: 1,
        start: timeStart,
        end: timeEnd 
      }),
      this.parent.handLAnim.sliceSet({
        animationData: this.animations.L_hand,
        start: timeStart,
        end: timeEnd 
      }),
      this.parent.handRAnim.sliceSet({
        animationData: this.animations.R_hand,
        start: timeStart,
        end: timeEnd 
      })
    ]

    this.parent.cubeAnim.showFrameAt()
    this.parent.handLAnim.showFrameAt()
    this.parent.handRAnim.showFrameAt()
  }
  stepAnimationPointSet(index, point){
    // console.log({index, point})
    const grpImgs = this.groupImages
    for(let i=grpImgs[index];i<grpImgs[index+1];i++){
      // console.log({i, imgAnims:this.imgAnims[i]})
      this.imgAnims[i].currentTime = point
    }
  }
  stepAnimationStart(index, speed){
    const grpImgs = this.groupImages
    for(let i=grpImgs[index];i<grpImgs[index+1];i++){
      this.imgAnims[i].playbackRate = speed
      this.imgAnims[i].play()
    }
  }
  stepAnimationPause(index){
    const grpImgs = this.groupImages
    for(let i=grpImgs[index];i<grpImgs[index+1];i++){
      this.imgAnims[i].pause()
    }
  }
  rotImgIns(data = {type: "step", value: -1}){
    switch(data.type){
      case "step":
        if(data.value < 0  || this.groupRotesCube.length < data.value)
          return {type: "step", check: false}

        let m = this.towRotes.filter((a) => a<this.groupRotesCube[data.value])
        if(this.groupRotesCube.length == data.value)  
          return {type: "step", check: true,
                  id: this.Rotes.length-this.towRotes.filter((a) => a<this.Rotes.length-1).length}
        
        if(this.groupRotesCube.length-1 == data.value)  
          return {type: "step", check: true,
                  id0: this.groupRotesCube[data.value] - this.towRotes.filter((a) => a<this.groupRotesCube[data.value]).length,
                  id1: this.Rotes.length-this.towRotes.filter((a) => a<this.Rotes.length-1).length}
        // imgId = index
        return {type: "step", check: true,
                id0: this.groupRotesCube[data.value] - this.towRotes.filter((a) => a<this.groupRotesCube[data.value]).length,
                id1: this.groupRotesCube[data.value+1] - this.towRotes.filter((a) => a<this.groupRotesCube[data.value+1]).length}

      case "time":
        let _index = this.cubeRotesTime.findLastIndex((x)=>x<data.value)

        if(_index == -1)
          return {type: "time", rotId:-1, imgId:-1, move:-1, rotTime:-1, now: false, imgType:-1}

        // console.log({value:data.value})
        let rotDur  = 1000 / this.cubeRotesData[_index].timeScale
        let rotTime = {start: this.cubeRotesTime[_index], end: this.cubeRotesTime[_index]+ rotDur}
        let move = this.Rotes[_index]
        let max = this.towRotes.filter((a) => a<_index)
        let imgId = _index - max.length
        let imgType = this.towRotes.indexOf(_index  ) != -1 ? "Before" :  
                   this.towRotes.indexOf(_index-1) != -1 ? "After"  : "no"
        // console.log({value:data.value, rotId:_index, imgId, move, rotTime, now: data.value <= rotTime.end, imgType})
        return {type: "time", rotId:_index, imgId, move, rotTime, now: data.value <= rotTime.end, imgType, value:data.value}

        // if(data.value < 0  || this.groupRotesCube.length < data.value)
        //   return undefined

        // max = this.towRotes.filter((a) => a<=this.groupRotesCube[data.value])
        // if(this.groupRotesCube.length == data.value)  
        //   return this.Rotes.length-this.towRotes.filter((a) => a<=this.Rotes.length-1).length

        // // imgId = index
        // return this.groupRotesCube[data.value] - max.length
    }
    // this.rotImgs
    // this.groupRotesCube
    // t=this
    // index = t.cubeRotesTime.findLastIndex((x)=>x<time)
    // move = t.Rotes[index]
    // const max = t.towRotes.filter((a) => a<=index)
    // imgId = index - max.length
    // half = max.at(-1) == index-1
    // console.log({id:index,time:t.cubeRotesTime[index], imgId, move, half})

  }
  meter_set(index){
 // console.log(this.meterData)
    if(this.step_time_meter !== null){
      // console.count(`step_time_meter.removeEvent ${index}`)
      // console.log(this.step_time_meter)
      this.step_time_meter.dispose()
      this.step_time_meter = null
    }

    this.step_time_meter = new meter({
      id: this.meterData.area,
      el: this.meterData.bar,
      start: 0,
      end: this.stepStartTime[index+1] - this.stepStartTime[index],
      value: 0,
      dx: 10,
      constSet: true,
      callbackfunc: {func1: this, func2: "meter"},
      count_Disp: false,
    })

    // this.step_time_meter = new meter({
    //   id: this.meterData.area,
    //   el: this.meterData.bar,
    //   start: this.stepStartTime[index],
    //   end: this.stepStartTime[index+1],
    //   value: this.stepStartTime[index],
    //   dx: 10,
    //   constSet: true,
    //   callbackfunc: {func1: this, func2: "meter"},
    //   count_Disp: false,
    // })
  }
  step_scroll(index){
    const _list = document.querySelector(".list")
    const hei = _list.children[index].offsetTop
    
    for(let i=0;i<16;i++){
      if(i == index)  continue
      const St = document.querySelectorAll(`.step${i}`)
      for(let s=0;s<St.length;s++)
        St[s].classList.remove("now-step")
    }

    const St = document.querySelectorAll(`.step${index}`)
    for(let i=0;i<St.length;i++)
      St[i].classList.add("now-step")

    _list.scrollTo({
      top: hei - _list.clientHeight/2,
      left: 0,
      behavior: "smooth",
    })
  }
  frame_set(a){
    const data = {
      clip: "fullanimation" ,
      frame: a,
    }

    this.L_hand.removeAttribute("my-animation")
    this.L_hand.setAttribute("my-animation",data)

    this.R_hand.removeAttribute("my-animation")
    this.R_hand.setAttribute("my-animation",data)

    this.full_cube.removeAttribute("my-animation")
    this.full_cube.setAttribute("my-animation",data)

  }
  frame(time){
    this.parent.cubeAnim.showFrameAt({time})
    this.parent.handLAnim.showFrameAt({time})
    this.parent.handRAnim.showFrameAt({time})
  }
  animationStart(timeScale){
    this.parent.cubeAnim.play({timeScale})
    this.parent.handLAnim.play({timeScale})
    this.parent.handRAnim.play({timeScale})
  }
  remove_Animation(){
    this.parent.cubeAnim.stop()
    this.parent.handLAnim.stop()
    this.parent.handRAnim.stop()
  }
  meter(Data){
    
    if(this.parent.cube_mode !== "Execution")	return

    const index = this.stepSkip[this.stepCount]
    if(index == undefined || index == -1){
      // console.log("現在のステップはスキップ")  
      return
    }

    // console.log({name: `this meter`, Data})
    this.stopTime = Data.value

    if(this.step_move){
      // console.log("アニメーション中")  
      clearTimeout(this.timeOutId)
      this.remove_Animation()
      this.stepAnimationPause(index)
      this.stepAnimationPointSet(index, Data.value)
      // this.stepAnimationPointSet(index, Data.value - this.stepStartTime[index])
      this.step_move = false    
      // this.meterBar.classList.remove("meter-animating")
      this.frame(Data.value/1000)
      return
    } 

    this.frame(Data.value/1000)

    this.stepAnimationPause(index)
    this.stepAnimationPointSet(index, Data.value)
    // this.stepAnimationPointSet(index, Data.value - this.stepStartTime[index])
  }
  frameObjSet(index){
    const f = [
      ["ed10"], ["ed09"], ["ed08"], ["ed11"],
      ["co06"], ["co05"], ["co04"], ["co07"],
      ["ed02"], ["ed01"], ["ed00"], ["ed03"],
      ["ed04","ed05","ed06","ed07"],
      ["co00","co01","co02","co03"],
      ["ed04","ed05","ed06","ed07"],
      ["co00","co01","co02","co03"],

      ["co00","co01","co02","co03","co04","co05","co06","co07"],
      ["ce00","ce01","ce02","ce03","ce04","ce05"],
      ["ed00","ed01","ed02","ed03","ed04","ed05","ed06","ed07","ed08","ed09","ed10","ed11"],
    ]

    const F = f[index]
    const _bone = this.parent.ObjectManager.objects.cube.children
    const bone = {
      "ce": _bone.slice(0, 6),
      "co": _bone.slice(6, 14),
      "ed": _bone.slice(14),
    }
    
    const baseQua = {
      "co": [
        [0,0,0,0],
        [0,-0.7071067811865476,0,0.7071067811865476],
        [0,1,0,0],
        [0,0.7071067811865476,0,0.7071067811865476],
        [0.7071067811865476,0,0.7071067811865475,0],
        [0,0,1,0],
        [0.7071067811865476,0,-0.7071067811865475,0],
        [1,0,0,0]
      ],
      "ce": [
        [0,0,0,1],
        [0,-0.7071067811865476,0,0.7071067811865476],
        [0,1,0,0],
        [0, 0.7071067811865476,0,0.7071067811865476],
        [0.7071067811865476,0,0,0.7071067811865476],
        [-0.7071067811865476,0,0,0.7071067811865476],
      ],
      "ed": [
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0],
        [1,0,0,0],
        [0.5,-0.5,0.5,0.5],
        [-0,0.7071067811865476,-0.7071067811865475,0],
        [0.5,0.5,-0.5,0.5],
        [0.7071067811865475,0,0,0.7071067811865476],
        [-0.5,-0.5,-0.5,0.5],
        [0,0.7071067811865475,0.7071067811865476,0],
        [-0.5,0.5,0.5,0.5],
        [-0.7071067811865475,0,0,0.7071067811865476],
      ]
    }

    const posName = {
      "ce": "c",
      "co": "cp",
      "ed": "ep",
    }

    const baseframe = {"co": 0, "ed":1, "ce":2}

    // boneNumber.c.indexOf(Datas.c[j]))
    // bone.ce[0].remove(this.frameObj[0])
    let objes = []
    F.forEach((e)=>{
      const type = e.slice(0,2)
      const number = this.Datas.at(-1)[posName[type]][parseInt(e.slice(-2))]
      // const number = this.boneNumber[posName[type]]
      //   .indexOf(this.Datas.at(-1)[posName[type]][parseInt(e.slice(-2))])

      // objes.push(bone[type][number])
    })

    // console.log({index, F, objes})
/* モジュール化
    if(this.outLineModule == null){
      // console.log(`components no`)
      this.outLineModule = new outline({model: this.full_cube, objects: objes, scene: this.scene})
    }
    else{
      // console.log(`components hit`)
      // console.log(comp)
      // console.log(comp.selectedObjects)
      this.outLineModule.outlinePass.selectedObjects = objes
    }
*/
  }

    async next_btn_func(){
      if(this.parent.cube_mode !== "Execution")	return
      if(this.step_move)  return
      
      if(this.stepCount == 15)  return {skip: true, check: "over"}
    
      this.stepCount++
      await this.stepChange(this.stepCount)
    }
    async back_btn_func(){
      if(this.parent.cube_mode !== "Execution")	return
      if(this.step_move)  return
    
      if(this.stepCount == 0)  return {skip: true, check: "over"}
    
      this.stepCount--
      await this.stepChange(this.stepCount)
    }
    stop_btn_func(){
      if(this.parent.cube_mode !== "Execution")	return
      if(!this.step_move) return
    
      clearTimeout(this.timeOutId)
      clearTimeout(this.imgTimeOutId)
    
      const index = this.stepSkip[this.stepCount]
      const durtime =  (Date.now() - this.animation_start_time)
      const value = this.mode_direction * Math.max(durtime, 0) + this.stopTime
    
      this.stopTime = value
    
      this.mode_direction = undefined
    
      this.remove_Animation()
      this.step_move = false
    
      this.stepAnimationPause(index)
      this.stepAnimationPointSet(index,value)
      this.step_time_meter.animationPause(value)
    }
    play_btn_func(){
      
      if(this.parent.cube_mode !== "Execution")	return
      if(this.step_move) return
    
      const index = this.stepSkip[this.stepCount]
      if(index == -1)  return {skip: true, }
    
      this.vec = `play`
      this.mode_direction = this.parent.rote_speed
    
      if(this.stopTime >= this.stepStartTime[index+1] - this.stepStartTime[index]){
        this.stopTime = 0
        this.step_time_meter.Update_Value_From_Bar(this.stopTime)
        this.frame(this.stopTime/1000)
      }
    
      this.stepAnimationPointSet(index,this.stopTime)
    
      this.step_move = true
    
      // this.animation(
      //   this.stopTime/1000,
      //   this.stepStartTime[index+1]/1000, this.parent.rote_speed)
      this.animationStart(this.mode_direction)

      this.animation_start_time = Date.now()
      this.stepAnimationStart(index, this.mode_direction)
      this.step_time_meter.animationPlay(this.stopTime, this.mode_direction)
    }
    reverse_btn_func(){
      
      
      if(this.parent.cube_mode !== "Execution")	return
      if(this.step_move) return
    
      const index = this.stepSkip[this.stepCount]
      if(index == -1) return {skip: true, }
    
      this.vec = `reverse`
      this.mode_direction = -this.parent.rote_speed
    
      if(this.stopTime <= 0){
        this.stopTime = this.stepStartTime[index+1] - this.stepStartTime[index]
        this.step_time_meter.Update_Value_From_Bar(this.stopTime)
        this.frame(this.stopTime/1000)
      }
    
      this.stepAnimationPointSet(index, this.stopTime)
    
      this.step_move = true
    
      // this.animation(
      //   this.stopTime/1000,
      //   this.stepStartTime[index]/1000, this.parent.rote_speed)
      this.animationStart(this.mode_direction)
        
      this.animation_start_time = Date.now()
      this.stepAnimationStart(index, -this.parent.rote_speed)
      this.step_time_meter.animationPlay(this.stopTime, -this.parent.rote_speed)
    }
    async learning_btn_func(){
      
      if(this.step_move) return
      if(this.parent.cube_mode != "Execution" && this.parent.cube_mode != "learning") return
    
      const index = this.stepSkip[this.stepCount]
    
      if(this.parent.cube_mode == "Execution"){
    
        // this.full_cube.object3D.traverse((e)=>{
        //   if(e.type=="Group" && ( e.name=="fco" || e.name=="fce" || e.name=="fed")){
        //     e.removeFromParent()
        //   }
        // })
        
        this.parent.ObjectManager.objects.handL.visible = false
        this.parent.ObjectManager.objects.handR.visible = false
    
        this.learning_btn.querySelector("p").textContent = '解説モードへ'

        this.parent.dispCube.cube = this.Datas[this.groupRotesCube[index]]
        // cubeset(full_cube.object3D, this.dispCube.cube)
        cubeset(this.parent.ObjectManager.objects.cube, this.parent.dispCube.cube)
    
        this.parent.Mode_set("learning")
      }
      else if(this.parent.cube_mode == "learning"){
        this.parent.Mode_set("Execution")

        this.parent.ObjectManager.objects.handL.visible = true
        this.parent.ObjectManager.objects.handR.visible = true
        
        this.learning_btn.querySelector("p").textContent = '試行モードへ'
    
        await this.stepChange(this.stepCount)
      }
    }
    async stepList_func(e){
      
      if(this.parent.cube_mode !== "Execution")	return
      if(this.step_move) return
    
      let newStep = -1
      if(this.step_move){
        // console.log(`動作中`)
        return
      }
    
      if(e.target.classList.contains("step-thiss")){
        // console.log(`枠 return`)
        return
      }
      
      if(e.target.classList.contains("step-mode")){
        // console.log(`step return`)
        if(parseInt(e.target.classList[1].slice(4)) == this.stepCount) return
        newStep = e.target.classList[1].slice(4)
      }
    
      else{
        // console.log(`step in step return`)
        newStep = e.target.classList[0].slice(4)
      }
    
      await this.stepChange(parseInt(newStep))
    }
    execution_btn_func(){
      if(this.parent.cube_mode !== "Execution")	return
      if(this.step_move) return
    
      this.learning_btn.style.display = "none"
      
      this.next_btn.removeEventListener("click", this.next_btn_func)
      this.back_btn.removeEventListener("click", this.back_btn_func)
      this.stop_btn.removeEventListener("click", this.stop_btn_func)
      this.play_btn.removeEventListener("click", this.play_btn_func)
      this.reverse_btn.removeEventListener("click", this.reverse_btn_func)
      this.learning_btn.removeEventListener("click", this.learning_btn_func)
      this.stepList.removeEventListener("click", this.stepList_func)
      this.execution_btn.removeEventListener("click", this.execution_btn_func)
      this.parent.cubeAnim.mixer.removeEventListener("finished", this.stepAnimationEnd)

      this.step_time_meter.dispose()
      this.step_time_meter = null

      // this.full_cube.object3D.traverse((e)=>{
      //   if(e.type=="Group" && ( e.name=="fco" || e.name=="fce" || e.name=="fed")){
      //     e.removeFromParent()
      //   }
      // })
      
/* モジュール化
      if(this.outLineModule != null) {
        this.outLineModule.remove()
        this.outLineModule = null
        //this.full_cube.removeAttribute("model-outline")
      }
*/
      
      this.stepRmoveAnim()
      
      console.log("解説　終了")
      this.parent.Execution_End()
    }
    stepAnimationEnd(){
      
      if(this.parent.cube_mode !== "Execution")	return
      if(!this.step_move) return
    
      const index = this.stepSkip[this.stepCount]
    
      if(index == -1){
        return {skip: true, }
      }

      console.log(`アニメーション  終了`)

      const _index = this.mode_direction > 0 ? index+1 : index
    
      // console.log({func: `animation-finished`, _index})
      this.step_move = false
      this.stopTime = this.stepStartTime[_index] - this.stepStartTime[index]
      this.step_time_meter.animationPause(this.stopTime)
    }
}