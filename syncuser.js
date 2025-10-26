export class syncuser{
  userId = null
  #user = null
  iframeId = null
  rotationId = null
  loadIframeCount = null

  constructor(data = {}){
    const _main = document.querySelector("#main-display")

    const iframe = document.createElement("iframe")
    iframe.src = "./axesHelper.html"
    iframe.id = "iframe"
    // iframe.width = "50px";
    // iframe.height = "50px";

    _main.appendChild(iframe)

    // this.frame = iframe

    this.userId = data.userId || "userPosition"
    // this.camera = document.querySelector("#camOut")
    this.iframe = iframe

    this.getIframe = this.getIframe.bind(this)
    const firstCheck = this.getIframe()

    if(!firstCheck){
      this.loadIframeCount = 0
      this.iframeId = setInterval(this.getIframe,1000)
      // /*log*/ console.log(`初回 iframeの読み込み 失敗`)
    }
    else{
      this.upDateSet()
      // /*log*/ console.log(`初回成功  iframeの読み込み完了`)
    }

  }
  get user(){
    return this.#user
  }
  set user(el){
    if(el != null && this.iframeId === null){
      clearInterval(this.iframeId)
      this.#user = el

      this.upDateSet()
    }
  }
  getIframe(){
    try {
      this.user = this.iframe.contentWindow 
      return this.user != null
    } catch (error) {
      this.loadIframeCount += 1
      if(this.loadIframeCount == 10){
        clearInterval(this.iframeId)
        // /*log*/ console.log(`iframeの読み込みを行えない エラー`)
      }
      return false
    }
  }
  upDateSet(){
    // this.upDate = this.upDate.bind(this)
    // this.rotationId = setInterval(this.upDate,100)
    // /*log*/ console.log(`ローテーションの更新の初期設定`)
  }
  // upDate() {
  //   const rot = this.camera.object3D.rotation
  //   this.user.object3D.rotation.copy(rot)
  // }
  manual(rot) {
    // console.log({rot, user: this.user})
    if(this.user === null)  return

    const pos = {
      x: 2 * Math.sin(rot.y) * Math.cos(rot.x),
      y: 2 * Math.sin(-rot.x),
      z: 2 * Math.cos(rot.y) * Math.cos(rot.x),
    }

    this.user.SceneManager.camera.position.set(pos.x, pos.y, pos.z)
    this.user.SceneManager.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }
}

// export class syncuser{
//   userId = null
//   #user = null
//   iframeId = null
//   rotationId = null
//   loadIframeCount = null

//   constructor(data = {}){
//     this.userId = data.userId || "userPosition"
//     this.camera = document.querySelector("#camOut")
//     this.iframe = document.querySelector("#iframe")

//     this.getIframe = this.getIframe.bind(this)
//     const firstCheck = this.getIframe()

//     if(!firstCheck){
//       this.loadIframeCount = 0
//       this.iframeId = setInterval(this.getIframe,1000)
//       // /*log*/ console.log(`初回 iframeの読み込み 失敗`)
//     }
//     else{
//       this.upDateSet()
//       // /*log*/ console.log(`初回成功  iframeの読み込み完了`)
//     }

//   }
//   get user(){
//     return this.#user
//   }
//   set user(el){
//     if(el != null && this.iframeId === null){
//       clearInterval(this.iframeId)
//       this.#user = el

//       this.upDateSet()
//     }
//   }
//   getIframe(){
//     try {
//       const doc = this.iframe.contentDocument || this.iframe.contentWindow.document
//       this.user = doc.getElementById(this.userId)
//       return this.user != null
//     } catch (error) {
//       this.loadIframeCount += 1
//       if(this.loadIframeCount == 10){
//         clearInterval(this.iframeId)
//         // /*log*/ console.log(`iframeの読み込みを行えない エラー`)
//       }
//       return false
//     }
//   }
//   upDateSet(){
//     // this.upDate = this.upDate.bind(this)
//     // this.rotationId = setInterval(this.upDate,100)
//     // /*log*/ console.log(`ローテーションの更新の初期設定`)
//   }
//   upDate() {
//     const rot = this.camera.object3D.rotation
//     this.user.object3D.rotation.copy(rot)
//   }
//   manual(rot) {
//     if(this.user != null)
//       this.user.object3D.rotation.set(rot.x, rot.y, rot.z)
//   }
// }
