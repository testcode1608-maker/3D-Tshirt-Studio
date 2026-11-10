import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const viewer=document.querySelector('#viewer'),loading=document.querySelector('#loading');
const scene=new THREE.Scene();scene.background=new THREE.Color('#1b1e25');
const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.25,7.3);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;viewer.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;controls.target.set(0,.15,0);controls.minDistance=4;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.85;
scene.add(new THREE.HemisphereLight(0xe6edff,0x29212a,2.1));
const key=new THREE.DirectionalLight(0xffe3ce,3.2);key.position.set(-3,5,5);key.castShadow=true;scene.add(key);
const fill=new THREE.DirectionalLight(0x9eb8ff,1.8);fill.position.set(4,1,3);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,2.3);rim.position.set(0,3,-4);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(4,64),new THREE.MeshStandardMaterial({color:'#292c33',roughness:.95}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.15;floor.receiveShadow=true;scene.add(floor);
const avatar=new THREE.Group();scene.add(avatar);
const outfit=new THREE.MeshStandardMaterial({color:'#d8d5ce',roughness:.76});
const skin=new THREE.MeshStandardMaterial({color:'#c58d70',roughness:.82});
const dark=new THREE.MeshStandardMaterial({color:'#242027',roughness:.9});
const shoeMat=new THREE.MeshStandardMaterial({color:'#24262c',roughness:.85});
function capsule(parent,radius,length,material,pos,rotation=[0,0,0]){const m=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,8,16),material);m.position.set(...pos);m.rotation.set(...rotation);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,scale,material,pos){const m=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),material);m.scale.set(...scale);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
// Legs and footwear
capsule(avatar,.19,.73,outfit,[-.23,-1.05,0]);capsule(avatar,.19,.73,outfit,[.23,-1.05,0]);
sphere(avatar,[.22,.12,.38],shoeMat,[-.23,-1.88,.13]);sphere(avatar,[.22,.12,.38],shoeMat,[.23,-1.88,.13]);
// Torso, neck and shoulders
capsule(avatar,.48,.78,outfit,[0,.05,0]);sphere(avatar,[.55,.22,.28],outfit,[0,.48,0]);
capsule(avatar,.13,.22,skin,[0,.69,0]);
// Arms angled slightly outward
capsule(avatar,.14,.72,outfit,[-.66,.06,0],[0,0,-.12]);capsule(avatar,.14,.72,outfit,[.66,.06,0],[0,0,.12]);
sphere(avatar,[.14,.17,.14],skin,[-.72,-.42,.01]);sphere(avatar,[.14,.17,.14],skin,[.72,-.42,.01]);
// Head and ears
const head=sphere(avatar,[.39,.49,.36],skin,[0,1.28,.02]);
sphere(avatar,[.085,.13,.08],skin,[-.39,1.28,0]);sphere(avatar,[.085,.13,.08],skin,[.39,1.28,0]);
// Hair cap and subtle fringe
const hair=sphere(avatar,[.405,.25,.38],dark,[0,1.59,-.015]);hair.scale.y=.88;
sphere(avatar,[.27,.10,.075],dark,[0,1.48,.33]);
// Face photo plane is fitted into a rounded crop and placed on the front of the head.
const faceCanvas=document.createElement('canvas');faceCanvas.width=512;faceCanvas.height=512;const fctx=faceCanvas.getContext('2d');
const faceTexture=new THREE.CanvasTexture(faceCanvas);faceTexture.colorSpace=THREE.SRGBColorSpace;
const faceMaterial=new THREE.MeshBasicMaterial({map:faceTexture,transparent:true,side:THREE.DoubleSide,depthWrite:false});
const face=new THREE.Mesh(new THREE.PlaneGeometry(.54,.57),faceMaterial);face.position.set(0,1.29,.355);avatar.add(face);
function loadFace(src){const img=new Image();img.onload=()=>{fctx.clearRect(0,0,512,512);fctx.save();fctx.beginPath();fctx.roundRect(0,0,512,512,92);fctx.clip();const side=Math.min(img.width,img.height),sx=(img.width-side)/2,sy=(img.height-side)/2;fctx.drawImage(img,sx,sy,side,side,0,0,512,512);fctx.restore();faceTexture.needsUpdate=true;document.querySelector('#save-status').textContent='● PHOTO CONNECTED';};img.onerror=()=>{document.querySelector('#save-status').textContent='● PHOTO NOT FOUND';};img.src=src;}
loadFace('./assets/img.jpg');
function resize(){const w=viewer.clientWidth,h=viewer.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}new ResizeObserver(resize).observe(viewer);resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();setTimeout(()=>loading.classList.add('hidden'),900);
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>{outfit.color.set(b.dataset.color);document.querySelectorAll('.swatch').forEach(x=>x.classList.toggle('active',x===b));}));
document.querySelectorAll('.style-chip').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.style-chip').forEach(x=>x.classList.toggle('active',x===b));if(b.dataset.style==='toon'){outfit.roughness=.95;skin.roughness=1;renderer.toneMappingExposure=1.25;}else if(b.dataset.style==='mono'){outfit.color.set('#777b82');skin.color.set('#99999b');dark.color.set('#303137');}else{outfit.roughness=.76;skin.color.set('#c58d70');dark.color.set('#242027');renderer.toneMappingExposure=1.12;}}));
const upload=document.querySelector('#image-upload');upload.addEventListener('change',()=>{const file=upload.files?.[0];if(!file)return;if(file.size>10*1024*1024){alert('Please choose an image smaller than 10 MB.');return;}const url=URL.createObjectURL(file);loadFace(url);});
document.querySelector('#avatar-scale').addEventListener('input',e=>{const v=Number(e.target.value)/100;avatar.scale.setScalar(v);document.querySelector('#scale-value').textContent=e.target.value+'%';});
function setView(name){avatar.rotation.y=name==='back'?Math.PI:name==='side'?Math.PI/2:0;document.querySelectorAll('.view-control').forEach(b=>b.classList.toggle('active',b.id===name+'-view'));document.querySelector('#view-name').textContent=name.toUpperCase()+' VIEW';}
document.querySelector('#front-view').addEventListener('click',()=>setView('front'));document.querySelector('#side-view').addEventListener('click',()=>setView('side'));document.querySelector('#back-view').addEventListener('click',()=>setView('back'));
function reset(){avatar.rotation.set(0,0,0);avatar.scale.setScalar(1);camera.position.set(0,.25,7.3);controls.target.set(0,.15,0);controls.update();setView('front');document.querySelector('#avatar-scale').value=100;document.querySelector('#scale-value').textContent='100%';}
document.querySelector('#reset-view').addEventListener('click',reset);document.querySelector('#reset-tool').addEventListener('click',reset);
document.querySelector('#orbit-tool').addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=1.2;document.querySelector('#orbit-tool').classList.toggle('active',controls.autoRotate);});
document.querySelector('#export-btn').addEventListener('click',()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='hani-3d-avatar.png';a.href=renderer.domElement.toDataURL('image/png');a.click();});
