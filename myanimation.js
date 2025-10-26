const myanimation = () => ({
	schema: {
		clip: {type: 'string', default: ""},
		timeScale: {type: 'number', default: 1},
    start: {type: 'number', default: 0},
    end: {type: 'number', default: Infinity},
    frame: {type: "number", default: NaN},
    finish: {type: "boolean", default: false},
	},	
	init() {
    this.duration = -1
    this.startTime = 0
    
    // console.log(this.data)
    // console.log(this.el.object3D.children[0].animations.map((n)=>{return n.name}))
    this.ani = this.el.object3D.children[0].animations.find((n) => n.name == this.data.clip)

    const dur = this.ani.duration // 元のアニメーションの時間
    // this.data.start = isNaN(this.data.start)?dur:this.data.start
    
    if(this.ani === undefined){
      console.trace(`[${this.data.clip}] no glb model animation`)
      console.error(`[${this.data.clip}] no glb model animation`)
      return
    }

    this.data.start = (this.data.start == Infinity ? dur : this.data.start)
    this.data.end   = (this.data.end   == Infinity ? dur : this.data.end  )

    if(this.data.start == this.data.end){
      console.trace(`time start == end`)
      console.error(`time start == end`)
      return
    }
    if(this.data.start < 0 || dur < this.data.start){
      console.trace(`over start ${this.data.start}/${dur}`)
      console.error(`over start ${this.data.start}/${dur}`)
      return
    }
    if(this.data.end < 0 || dur < this.data.end){
      console.trace(`over end ${this.data.end}/${dur}`)
      console.error(`over end ${this.data.end}/${dur}`)
      return
    }


    this.data.timeScale = Math.abs(this.data.timeScale)

		this.direction = this.data.start < this.data.end ? 1 : -1
    this.sumTime = Math.abs(this.data.start - this.data.end)
    this.duration = this.sumTime / this.data.timeScale * 1000

    this.parts = []
    this.el.object3D.traverse(t => {
      if(t.type == "Bone"){
        this.parts.push(t)
      }
    })

    if(isNaN(this.data.frame)){
      this.startTime = Date.now()
      this.moveing = true
      // console.log(`start ${this.el.id} clip=[${this.data.clip}] time=${(Date.now()-baseTime)/1000}`)
      // console.log({
      //   timeScale: this.data.timeScale, direction: this.direction,
      //   duration: this.duration, sumTime: this.sumTime,
      // })
      return
    }

    this.moveing = false
    this.frame(this.ani.tracks, this.direction, this.data.frame)

    // console.log(this.parts)
  },
  tick() {
    // if(!this.data.move) return

    const nowTime = Date.now() - this.startTime

    if(nowTime >= this.duration){
      // console.log("tick")
      this.Mypause()
      return
    }

    const direc = this.direction
    const time = nowTime / this.duration * this.sumTime * direc + this.data.start
    // console.log(`${JSON.stringify({nowTime,direc,time})}`)
    this.frame(this.ani.tracks, direc, time)
    
  },
  frame(tracks, direc, time) {
    // direc 再生方向 time 元アニメーションでの再生位置
    // console.debug({tracks, direc, time})

    tracks.forEach(e => {
      const fullname = e.name.split(".")
      const type = fullname.pop()
      const move = this.parts.find((n) => n.name == fullname.join("."))

      // console.log({ff: e.name, fullname, type, move})

      let index = direc==1 ?  e.times.findLastIndex((n) => n < time) :
                              e.times.findIndex((n) => n > time)
      if(index == -1) index = 0
                              
      const len = type[0]=="q"?4:3
      // console.log({fullname,type,move,len,index})

      if((direc == -1 && index == 0 )  || (direc == 1 && index == e.times.length-1)){
        if(len == 3){
          move[type].x = e.values[index * len]
          move[type].y = e.values[index * len + 1]
          move[type].z = e.values[index * len + 2]
        }
        else{
          move.quaternion.x = e.values[index * len]
          move.quaternion.y = e.values[index * len + 1]
          move.quaternion.z = e.values[index * len + 2]
          move.quaternion.w = e.values[index * len + 3]
        }
      }
      else{
        const neInd = index + direc
        const dx = e.times[neInd] - e.times[index]
        const percent = (time - e.times[index]) / dx
        if(len == 3){
          move[type].x = e.values[index * len]
          move[type].y = e.values[index * len + 1]
          move[type].z = e.values[index * len + 2]
          move[type].x += (e.values[neInd * len]     - e.values[index * len] ) * percent
          move[type].y += (e.values[neInd * len + 1] - e.values[index * len + 1] ) * percent
          move[type].z += (e.values[neInd * len + 2] - e.values[index * len + 2] ) * percent
        }
        else{
          const a = new THREE.Quaternion(
            e.values[index * len],
            e.values[index * len + 1],
            e.values[index * len + 2],
            e.values[index * len + 3],
          )
          const b = new THREE.Quaternion(
            e.values[neInd * len],
            e.values[neInd * len + 1],
            e.values[neInd * len + 2],
            e.values[neInd * len + 3],
          )
          move.quaternion.slerpQuaternions(a, b, percent)
        }
      }
    })
  },
  Mypause(e) {
    // console.log(e)


    if(isNaN(this.data.frame)){
      const direc = this.direction
      const time = this.data.end
      this.frame(this.ani.tracks, this.direction, this.data.end)

      // console.log(`end   ${this.el.id} clip=[${this.data.clip}]time=${(Date.now()-baseTime)/1000}`)

      if(this.data.finish)  this.el.dispatchEvent(new Event("animation-finished"))
    }
    this.moveing = false
    this.pause()
    // this.el.removeAttribute(this)
  },
  pause(){

  },
  setFrame(time){
    this.frame(this.ani.tracks, this.direction, time)
  },
  remove(){
    // console.log(`remove   ${this.el.id} clip=[${this.data.clip}] time=${(Date.now()-baseTime)/1000}`)
    // console.log({moveing: this.moveing})
  }
})

let baseTime = Date.now()