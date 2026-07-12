
import {
  State, cubeset, wait, color_set, choice_object_color_set , COLOR_STATE
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

  animation_start_time = null
  meterData = null

  step_time_meter = null
  mode_direction = null
  rotImgs = null
  step_move = null

  step_move = null
  imgAnimData = null
  imgAnims = []
  // boneNumber = null
  #setData = {}
  /**
   * 
   * @param {object} [] モデルデータ
   */
  constructor({
    full_cube = null, 
    L_hand = null, R_hand = null, frameObj = null, dispCube = null,
    ObjectManager = null, AnimeManager = null, SceneManager = null,
    status = null, allow_practice= null, Change_Guide = null, Change_Practice = null,
    get_speed = null, set_ano = null, callback = null, sequential_checkbox = null, disp = null,
    gray_checkbox = null
  } = {}  ){

    this.full_cube = full_cube
    this.L_hand = L_hand
    this.R_hand = R_hand
    this.frameObj = frameObj
    this.dispCube = dispCube
    
    this.ObjectManager = ObjectManager
    this.AnimeManager = AnimeManager
    this.SceneManager = SceneManager
    this.status = status
    this.allow_practice = allow_practice
    this.Change_Guide = Change_Guide
    this.Change_Practice = Change_Practice
    this.get_speed = get_speed
    this.set_ano = set_ano
    this.callback = callback
    this.sequential_checkbox = sequential_checkbox
    this.gray_checkbox = gray_checkbox
    this.mainDisplay = disp

    this.animation_start_time = undefined
    
    this.meterData = {
      parent: document.querySelector(`.step-meter`)
    }

    this.step_time_meter = null
    this.mode_direction = undefined

    this.rotImgs = undefined

    this.step_move = undefined

    this.now_color_state = !gray_checkbox.checked ? COLOR_STATE.NORMAL : COLOR_STATE.LOW

    this.back_btn_func = this.back_btn_func.bind(this)
    this.back_btn = document.querySelector('.back-div')
    this.back_btn.addEventListener("click", this.back_btn_func)

    this.next_btn_func = this.next_btn_func.bind(this)
    this.next_btn = document.querySelector('.next-div')
    this.next_btn.addEventListener("click", this.next_btn_func)

    this.stop_btn_func = this.stop_btn_func.bind(this)
    this.stop_btn = document.querySelector('.stop-div')
    this.stop_btn.addEventListener("click", this.stop_btn_func)

    // this.play_btn_func = this.play_btn_func.bind(this)
    // this.play_btn = document.querySelector('.play-div')
    // this.play_btn.addEventListener("click", this.play_btn_func)

    this.toggle_playback_func = this.toggle_playback_func.bind(this)
    this.play_btn = document.querySelector('.play-div')
    this.play_btn.addEventListener("click", this.toggle_playback_func)

    this.reverse_btn_func = this.reverse_btn_func.bind(this)
    this.reverse_btn = document.querySelector('.reverse-div')
    this.reverse_btn.addEventListener("click", this.reverse_btn_func)

    this.stepList_func = this.stepList_func.bind(this)
    this.stepList = document.querySelector(`.step-lists`)
    this.stepList.addEventListener("click", this.stepList_func)

    this.sulvesButtons = document.querySelector(".sulves-buttons")
    this.sulvesButtons.style.gridTemplateColumns = `repeat(${3}, 1fr)`

    this.play_space_key = this.play_space_key.bind(this)
    window.addEventListener("keydown", this.play_space_key)

    this.stepAnimationEnd = this.stepAnimationEnd.bind(this)
    this.AnimeManager.mixersName.cube.mixer.addEventListener('finished', this.stepAnimationEnd)

    this.sequential_change_func = this.sequential_change_func.bind(this)
    this.sequential_checkbox.addEventListener("change", this.sequential_change_func)

    this.cube_gray_change_func = this.cube_gray_change_func.bind(this)
    this.gray_checkbox.addEventListener("change", this.cube_gray_change_func)
      
    this.learning_btn = document.createElement("div")
    this.learning_btn.classList.add("learning-div")

    const _p = document.createElement("p")
    _p.textContent = '試行モードへ'
    this.learning_btn.appendChild(_p)

    this.learning_btn_func = this.learning_btn_func.bind(this)
    this.learning_btn.addEventListener("click", this.learning_btn_func)

    this.mainDisplay.appendChild(this.learning_btn)
    this.learning_btn.style.display = "none"

  }
  rotesListMake(Pattern){
    const imgSize = {
      min: 45,
      max: 60,
    }

    const _list = document.querySelector(".list")
    const listSize = {
      w: _list.clientWidth,
      h: _list.clientHeight,
    }

    this.stepGroupAnimCheck = Array.from({ length: this.groupRotesCube.length }, () => false)

    const imgW = Math.ceil(Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight)*0.07)

    const rotas = document.getElementsByClassName('rotas')
  
    const imgDiv = document.createElement('div')
    imgDiv.classList.add("img-div")
    // imgDiv.style.width = imgW
    // imgDiv.style.height = imgW

    const img = document.createElement('img')
    img.classList.add('rotate-img')

    const lineCount = parseInt(listSize.w / imgW)

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

    for(let i=0;i<Pattern.length;i++){
      rotas[i].innerHTML = ''
      if(Pattern[i].length == 0){
        const D = imgDiv.cloneNode(), I=img.cloneNode()
        // D.classList.remove("img-div")
        I.src=`./img/skip.png`
        I.style.width = `${3 * imgSize.max}px`
        rotas[i].parentElement.style.height = `${imgSize.max}px`
        // D.append(I)
        rotas[i].append(I)
        continue
      }

      let len = 0
      const _p = Pattern[i]
      for(let s=0;s<_p.length;s++){
        if(_p[s].length>2){
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
              if(_p[s] == n){
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

        for(let j of _p[s].split(" ")){
          len += 1
          const D = imgDiv.cloneNode(true), I=img.cloneNode()
          I.src=`./img/${j}.png`
          D.append(I)
          rotas[i].append(D)
        }

        if(_p[s].length>2){
          len += 1
          const D = imgDiv.cloneNode(), I=img.cloneNode()
          D.classList.remove("img-div")
          D.classList.add("frame-div")
          I.src=`./img/).png`
          D.append(I)
          rotas[i].append(D)
        }
      }      
      // console.log(`sum_solution [${sum_solution[i].length}]  lineCount [${lineCount}]`)

      // rotas[i].style.width = `${Math.min(len, lineCount) * imgW}px`
      rotas[i].parentElement.style.height = `${Math.ceil(len / lineCount) * imgW}px`

    }
    // this.rotImgs = document.querySelectorAll(".ima-div-back")
    // this.rotImgs = document.querySelectorAll(".rotate-img")
    this.rotImgs = document.querySelectorAll(".img-div")
  }
  _rotesListMake(Pattern){
    const _list = document.querySelector(".list")
    const listSize = {
      w: _list.clientWidth,
      h: _list.clientHeight,
    }

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
  }
  get setData(){
    return this.#setData
  }
  set setData(_d){
    console.debug(_d)
    // this.#setData = _d
  }
  async ins(_Datas, _color_data, _Rotes, _RotPatterns, animData){
    this.#setData = _Datas
    console.log(this.setData)
    
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

    this.rotesListMake(_RotPatterns)
  

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
    
    const f = [
      ["ed10"], ["ed09"], ["ed08"], ["ed11"],
      ["co06"], ["co05"], ["co04"], ["co07"],
      ["ed02"], ["ed01"], ["ed00"], ["ed03"],
      ["ed04"], ["co01"], ["ed05"], ["co02"],
    ]

    const posName = {
      "ce": "c",
      "co": "cp",
      "ed": "ep",
    }

    if(newStep == -1 || newStep == 16){
      // console.log("rote_re_start finish")
      return {is: false, type: "step over"}
    }
    this.stepCount = newStep

    this.set_ano(
      f[newStep][0].slice(0,2), 
      this.Datas.at(-1)[posName[f[newStep][0].slice(0,2)]][parseInt(f[newStep][0].slice(-2))]
    )
    
    this.step_scroll(this.stepCount)
    
    const index = this.stepSkip[this.stepCount]

    if(index == -1){
      const _index = this.stepSkip.slice(this.stepCount).find((e)=>e>-1)
      if(_index == undefined)  this.frame(this.stepStartTime.at(-1)/1000)
      else  this.frame(this.stepStartTime[_index]/1000)

      this.frameObjSet(this.stepCount)
      
      color_set(this.ObjectManager.objects.cube, this.now_color_state)
      this.grayTile(this.stepCount)

      this.learning_btn.style.display = "none"
      // console.log(`rote_re_start skip newId:${_index}`)
      return {is: false, type: "step skip"}
    }

    await this.rotImageAnimation2(index)

    this.stepAnimationPause(index)
    this.stepAnimationPointSet(index, 0)

    // console.log(`point 1`)

    
    // this.AnimeManager.mixersName.cube.remove()
    // cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    // this.AnimeManager.mixersName.cube.set({animationData: anims, fps: 1, timeScale: rotaSpped})
    // this.AnimeManager.mixersName.cube.action.paused = false

    this.stepRmoveAnim()
    this.stepMakeAnim(this.stepStartTime[index]/1000, this.stepStartTime[index+1]/1000)

    this.stopTime = 0

    // console.log(`point 2`)

    this.meter_set(index)
    this.frameObjSet(this.stepCount)
    

    color_set(this.ObjectManager.objects.cube, this.now_color_state)
    this.grayTile(this.stepCount)
    
    // this.learning_btn.style.display = "block"

    return {is: true, type: "ok"}
  }
  stepRmoveAnim(){
		this.AnimeManager.mixersName.cube.remove()
		this.AnimeManager.mixersName.L_hand.remove()
		this.AnimeManager.mixersName.R_hand.remove()
  }
  stepMakeAnim(timeStart, timeEnd){
    const check = [
      this.AnimeManager.mixersName.cube.sliceSet({
        animationData: this.animations.cube,
        fps: 1,
        start: timeStart,
        end: timeEnd 
      }),
      this.AnimeManager.mixersName.L_hand.sliceSet({
        animationData: this.animations.L_hand,
        start: timeStart,
        end: timeEnd 
      }),
      this.AnimeManager.mixersName.R_hand.sliceSet({
        animationData: this.animations.R_hand,
        start: timeStart,
        end: timeEnd 
      })
    ]

    this.AnimeManager.mixersName.cube.showFrameAt()
    this.AnimeManager.mixersName.L_hand.showFrameAt()
    this.AnimeManager.mixersName.R_hand.showFrameAt()
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
      parent: this.meterData.parent,
      start: 0,
      end: this.stepStartTime[index+1] - this.stepStartTime[index],
      value: 0,
      dx: 10,
      constSet: true,
      callbackfunc: this.meter.bind(this),
    })
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
    this.AnimeManager.mixersName.cube.showFrameAt({time})
    this.AnimeManager.mixersName.L_hand.showFrameAt({time})
    this.AnimeManager.mixersName.R_hand.showFrameAt({time})
  }
  animationStart(timeScale){
    this.AnimeManager.mixersName.cube.play({timeScale})
    this.AnimeManager.mixersName.L_hand.play({timeScale})
    this.AnimeManager.mixersName.R_hand.play({timeScale})
  }
  remove_Animation(){
    this.AnimeManager.mixersName.cube.stop()
    this.AnimeManager.mixersName.L_hand.stop()
    this.AnimeManager.mixersName.R_hand.stop()
  }
  meter(Data){
    
    if(!this.status())	return

    const index = this.stepSkip[this.stepCount]
    if(index == undefined || index == -1){
      // console.log("現在のステップはスキップ")  
      return
    }

    // console.log({name: `this meter`, Data})
    this.stopTime = Data.value

    // console.log(Data)

    if(Data.type === "mouseup" || Data.type === "touchend"){
      window.dispatchEvent(new CustomEvent("tutorial", {
        detail: {
          type: "user action",
          name: "meter-use" 
        }
      }))
    }

    if(this.step_move){
      // console.log("アニメーション中")  
      clearTimeout(this.timeOutId)
      this.remove_Animation()
      this.stepAnimationPause(index)
      this.stepAnimationPointSet(index, Data.value)
      // this.stepAnimationPointSet(index, Data.value - this.stepStartTime[index])
      this.step_move = false
      this.play_btn.dataset.state = "play"
      clearInterval(this.ano_upDate_id)
      this.frame(Data.value/1000)
      return
    } 

    this.frame(Data.value/1000)

    this.stepAnimationPause(index)
    this.stepAnimationPointSet(index, Data.value)

    this.callback()
    // this.stepAnimationPointSet(index, Data.value - this.stepStartTime[index])
  }
  frameObjSet(index){
    const f = [
      ["ed100"], ["ed090"], ["ed080"], ["ed110"],
      ["co060"], ["co050"], ["co040"], ["co070"],
      ["ed020"], ["ed010"], ["ed000"], ["ed030"],
      ["ed040","ed050","ed060","ed070"],
      ["co000","co010","co020","co030"],
      ["ed041","ed051","ed061","ed071"],
      ["co001","co002", "co011","co012", "co021","co022", "co031","co032"]
    ]

    const mdl_cubes = this.ObjectManager.objects.cube

    let objes = []
    f[index].forEach((e)=>{
      const _obj = mdl_cubes.getObjectByName(e)
      objes.push(_obj)
    })

    this.SceneManager.outlinePass.selectedObjects = objes
  }
  grayTile(index){
    const f = [
      ["ce00", "ce01", "ce02", "ce03", "ce04", "ce05", "ed10"], 
      ["ed09"], 
      ["ed08"], 
      ["ed11"],
      ["co06"], 
      ["co05"], 
      ["co04"], 
      ["co07"],
      ["ed02"], 
      ["ed01"], 
      ["ed00"], 
      ["ed03"],
      ["ed04","ed05","ed06","ed07"],
      ["co00","co01","co02","co03"],
      ["ed04","ed05","ed06","ed07"],
      ["co00","co00", "co01","co01", "co02","co02", "co03","co03"]
    ]

    const b=[
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11"],
        m: []
      },

      
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07"],
        m: []
      },
      

      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01","ed00"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01","ed00","ed03"],
        m: []
      },

      
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01","ed00","ed03",
            "ed04","ed05","ed06","ed07"],
        m: []
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01","ed00","ed03",
            "co00","co01","co02","co03"],
        m: ["ed040","ed050","ed060","ed070"]
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01","ed00","ed03",
        "ed04","ed05","ed06","ed07"],
        m: ["co000","co010","co020","co030"]
      },
      {
        g: ["ce00","ce01","ce02","ce03","ce04","ce05","ed10","ed09","ed08","ed11","co06","co05","co04","co07","ed02","ed01","ed00","ed03",
        "ed04","ed05","ed06","ed07","co00","co01","co02","co03"],
        m: []
      },
    ]

    const mdl_cubes = this.ObjectManager.objects.cube
    const Obj = b[index]


    Obj.g.forEach((_obj)=>{
      const obj = mdl_cubes.getObjectByName(_obj)
      choice_object_color_set(obj, COLOR_STATE.NORMAL)
    })
    Obj.m.forEach((_obj)=>{
      const obj = mdl_cubes.getObjectByName(_obj)
      choice_object_color_set(obj, COLOR_STATE.NORMAL)
    })

    // function traverseWithSkip(object, callback) {
    //   // コールバックを実行し、結果を受け取る
    //   // コールバック側で「これ以上下に行かない（スキップ）」なら true を返してもらうルールにする
    //   const shouldSkipChildren = callback(object);
      
    //   if (shouldSkipChildren) {
    //     return; // ここでリターンすることで、このオブジェクトの children の探索をスキップ！
    //   }

    //   // スキップしないで下に行く場合は、子要素を再帰的に走査
    //   for (let i = 0; i < object.children.length; i++) {
    //     traverseWithSkip(object.children[i], callback);
    //   }
    // }

    // traverseWithSkip(mdl_cubes, (obj) => {
    //   if (obj.type === "Group" && noObj.g.includes(obj.name)) {
    //     console.log("このグループ以下は探索しません");
    //     return true; // 下の階層への探索をスキップ
    //   }
      
    //   // 通常の処理
    //   if (obj.isMesh) {
    //     // メッシュに対する処理
    //     obj.material.color = {r: 0.1, g: 0.1, b: 0.1}
    //   }
      
    //   return false; // さらに下の階層も探索を続ける
    // })
  }
  async next_btn_func(){
    if(!this.status())	return {skip: true, check: "status"}
    if(this.step_move)  return {skip: true, check: "moving"}
    
    if(this.stepCount == 15)  return {skip: true, check: "over"}
  
    this.stepCount++
    const res = await this.stepChange(this.stepCount)
    if(res.is){
      
      window.dispatchEvent(new CustomEvent("tutorial", {
        detail: {
          type: "user action",
          name: "step-change-button" 
        }
      }))
    }
  }
  async back_btn_func(){
    if(!this.status())	return
    if(this.step_move)  return
  
    if(this.stepCount == 0)  return {skip: true, check: "over"}
  
    this.stepCount--
    const res = await this.stepChange(this.stepCount)
    if(res.is){
      
      window.dispatchEvent(new CustomEvent("tutorial", {
        detail: {
          type: "user action",
          name: "step-change-button" 
        }
      }))
    }
  }
  stop_btn_func(){
    if(!this.status())	return
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
    this.play_btn.dataset.state = "play"
    clearInterval(this.ano_upDate_id)
  
    this.stepAnimationPause(index)
    this.stepAnimationPointSet(index,value)
    this.step_time_meter.animationPause(value)
  }
  async play_btn_func(){
    
    if(!this.status())	return
    if(this.step_move) return

  
    this.mode_direction = this.get_speed()
  
    let index = this.stepSkip[this.stepCount]

    let isTimeEnd = this.stopTime - (this.stepStartTime[index+1] - this.stepStartTime[index])

    if(!this.sequential_isChanged && index == -1){
      return 
    }
    else if(!this.sequential_isChanged && isTimeEnd >= 0){
      this.step_move = true

      this.stopTime = 0
      this.step_time_meter.Update_Value_From_Bar(this.stopTime)
      this.frame(this.stopTime/1000)
    }
    
    if(this.sequential_isChanged && index == -1){

      const res = await this.stepChange(this.stepCount+1)

      if(res.is){

        this.step_move = true

        await wait(100)

        index = this.stepSkip[this.stepCount]
        isTimeEnd = this.stopTime - (this.stepStartTime[index+1] - this.stepStartTime[index])
      }
      else {
        return
      }
    }
    else if(this.sequential_isChanged && isTimeEnd >= 0){

      const res = await this.stepChange(this.stepCount+1)

      if(res.is){

        this.step_move = true

        await wait(100)

        index = this.stepSkip[this.stepCount]
        isTimeEnd = this.stopTime - (this.stepStartTime[index+1] - this.stepStartTime[index])
      }
      else if(res.type === "step over"){
        this.step_move = true

        this.stopTime = 0
        this.step_time_meter.Update_Value_From_Bar(this.stopTime)
        this.frame(this.stopTime/1000)
      }
      else {
        return
      }
    }
    
    window.dispatchEvent(new CustomEvent("tutorial", {
      detail: {
        type: "user action",
        name: "playback-button" 
      }
    }))
    
    this.step_move = true

    this.play_btn.dataset.state = "stop"
  
    this.stepAnimationPointSet(index,this.stopTime)

    
    this.ano_upDate_id = setInterval(this.callback, 30)
  
    this.animationStart(this.mode_direction)

    this.animation_start_time = Date.now()
    this.stepAnimationStart(index, this.mode_direction)

    this.step_time_meter.animationPlay(this.stopTime, this.mode_direction)
  }
  reverse_btn_func(){
    if(!this.status())	return
    if(this.step_move) return
  
    const index = this.stepSkip[this.stepCount]
    if(index == -1) return {skip: true, }
  
    this.mode_direction = -this.get_speed()
  
    if(this.stopTime <= 0){
      this.stopTime = this.stepStartTime[index+1] - this.stepStartTime[index]
      this.step_time_meter.Update_Value_From_Bar(this.stopTime)
      this.frame(this.stopTime/1000)
    }
  
    this.stepAnimationPointSet(index, this.stopTime)
  
    this.step_move = true
  
    // this.animation(
    //   this.stopTime/1000,
    //   this.stepStartTime[index]/1000, this.get_speed())
    this.animationStart(this.mode_direction)
      
    this.animation_start_time = Date.now()
    this.stepAnimationStart(index, -this.get_speed())
    this.step_time_meter.animationPlay(this.stopTime, -this.get_speed())
  }
  async learning_btn_func(){
    if(!this.status() && !this.allow_practice())	return
    if(this.step_move) return
  
    const index = this.stepSkip[this.stepCount]
  
    if(!this.allow_practice()){
  
      // this.full_cube.object3D.traverse((e)=>{
      //   if(e.type=="Group" && ( e.name=="fco" || e.name=="fce" || e.name=="fed")){
      //     e.removeFromParent()
      //   }
      // })
      
      this.ObjectManager.objects.handL.visible = false
      this.ObjectManager.objects.handR.visible = false
  
      this.learning_btn.querySelector("p").textContent = '解説モードへ'

      this.dispCube.cube = this.Datas[this.groupRotesCube[index]]
      // cubeset(full_cube.object3D, this.dispCube.cube)
      cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
  
      this.Change_Practice()
    }
    else if(this.allow_practice()){
      this.Change_Guide()

      this.ObjectManager.objects.handL.visible = true
      this.ObjectManager.objects.handR.visible = true
      
      this.learning_btn.querySelector("p").textContent = '試行モードへ'
  
      await this.stepChange(this.stepCount)
    }
  }
  async stepList_func(e){
    
    if(!this.status())	return
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
    
    window.dispatchEvent(new CustomEvent("tutorial", {
      detail: {
        type: "user action",
        name: "step-lists" 
      }
    }))
  
    await this.stepChange(parseInt(newStep))
  }
  async play_space_key(e){

    if(!this.status())	return
    if(!this.step_move && e.code == "Space"){
      this.play_btn_func()
      return
    }
    if(this.step_move && e.code == "Space"){
      this.stop_btn_func()
      return
    }
    
  }
  async toggle_playback_func(){

    if(!this.status())	return

    const state = this.play_btn.dataset.state
    if(!this.step_move && state === "play"){
      this.play_btn_func()
      return
    }
    if(this.step_move && state == "stop"){
      this.stop_btn_func()
      return
    }
  }
  dispose(){
    if(!this.status())	return
    if(this.step_move){
      return false
    }
  
    this.learning_btn.style.display = "none"
    
    this.next_btn.removeEventListener("click", this.next_btn_func)
    this.back_btn.removeEventListener("click", this.back_btn_func)
    this.stop_btn.removeEventListener("click", this.stop_btn_func)
    // this.play_btn.removeEventListener("click", this.play_btn_func)
    this.play_btn.removeEventListener("click", this.toggle_playback_func)

    this.reverse_btn.removeEventListener("click", this.reverse_btn_func)
    this.learning_btn.removeEventListener("click", this.learning_btn_func)
    this.stepList.removeEventListener("click", this.stepList_func)
    this.AnimeManager.mixersName.cube.mixer.removeEventListener("finished", this.stepAnimationEnd)
    
    this.sequential_checkbox.removeEventListener("change", this.sequential_change_func)
    this.gray_checkbox.removeEventListener("change", this.cube_gray_change_func)

    window.removeEventListener("keydown", this.play_space_key)

    this.step_time_meter.dispose()
    this.step_time_meter = null

    this.SceneManager.outlinePass.selectedObjects = []

    
    this.stepRmoveAnim()
    
    console.log("解説　終了")

    return true
  }
  stepAnimationEnd(){
    
    if(!this.status())	return
    if(!this.step_move) return
  
    const index = this.stepSkip[this.stepCount]
  
    if(index == -1){
      return {skip: true, }
    }

    const _index = this.mode_direction > 0 ? index+1 : index
  
    this.step_move = false
    this.play_btn.dataset.state = "play"

    clearInterval(this.ano_upDate_id)

    this.stopTime = this.stepStartTime[_index] - this.stepStartTime[index]
    this.step_time_meter.animationPause(this.stopTime)
  }
  sequential_change_func(event){
    // 💡 チェックボックスの値は .value ではなく .checked で受け取る（true / false）
    const isChecked = event.target.checked;
    this.sequential_isChanged = isChecked
    
    // if (isChecked) {
    //   console.log("連続再生モード：ON");
    // } else {
    //   console.log("連続再生モード：OFF");
    // }
  }
  cube_gray_change_func(event){
    const isChecked = event.target.checked;
    this.now_color_state = isChecked ? COLOR_STATE.LOW : COLOR_STATE.NORMAL

    
    color_set(this.ObjectManager.objects.cube, this.now_color_state)
    this.grayTile(this.stepCount)
  }
}