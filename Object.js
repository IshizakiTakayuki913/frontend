import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export class ObjectManager{
  objects = {}
  constructor(_data = {}){
  }
  async load(paths = []){
    const promises = paths.map(path => {
      return new Object({ modelPath: path.modelPath}).load()
    })

    const results = await Promise.all(promises)

    paths.forEach((path, i) => {
      this.objects[path.name] = results[i].scene
    })
    
    return
    // return  results.reduce((a, c) => a && c, true)
  }
  add(_data = {name: ``, modle: null}){
    this.objects[_data.name] = _data.modle
  }
}

export class Object{
  scene = null
  animations = null

  constructor(_data = { modelPath: null}){
    this.modelPath = _data.modelPath
  }
  async load(){
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        this.modelPath,
        gltf => {
          this.scene = gltf.scene
          this.animations = gltf.animations
          resolve(this)
        }, // 読み込み成功
        undefined,
        error => reject(error)  // 読み込み失敗
      );
    });
  }
}