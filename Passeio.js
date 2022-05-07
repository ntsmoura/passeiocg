// Controle de camera com GUI.

import * as THREE from "three";
import { MTLLoader } from "./Assets/scripts/three.js/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "./Assets/scripts/three.js/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "./Assets/scripts/three.js/examples/jsm/loaders/GLTFLoader.js";
import { FirstPersonControls } from "./Assets/scripts/three.js/examples/jsm/controls/FirstPersonControls.js";
import { PointerLockControls } from "./Assets/scripts/three.js/examples/jsm/controls/PointerLockControls.js";
import { GUI } from "./Assets/scripts/three.js/examples/jsm/libs/lil-gui.module.min.js";
import { Vector3, _SRGBAFormat } from "three";

let scene,
  renderer,
  camera,
  camControl,
  typeCamera,
  robot,
  mixer,
  actions,
  gltfScene,
  oldTime = 0,
  activeAction = 0;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const gui = new GUI();
const clock = new THREE.Clock();
let tourClock;
const rendSize = new THREE.Vector2();

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function main() {
  renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

  rendSize.x = window.innerWidth * 0.8;
  rendSize.y = window.innerHeight * 0.8;

  renderer.setSize(rendSize.x, rendSize.y);

  let canvas = document.getElementById("threejs-canvas");

  canvas.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45.0,
    window.innerWidth / window.innerHeight,
    0.01,
    500.0
  );

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  loadRobot();

  buildScene();

  initGUI();

  render();
}

/// ***************************************************************
/// **                                                           **
/// ***************************************************************

function onProgress(xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = (xhr.loaded / xhr.total) * 100;
    let loading = document.getElementById("info");
    if (percentComplete < 100) {
      loading.innerHTML = `<p>Baixando... ${Math.round(
        percentComplete,
        2
      )}%.<p>`;
    } else {
      loading.style.display = "none";
    }
  }
}

/// ***************************************************************
/// **                                                           **
/// ***************************************************************

function loadRobot() {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "./Assets/Models/GLTF/Expressive Robot/RobotExpressive.glb",
    function (gltf) {
      gltfScene = gltf.scene;
      robot = gltf.scene.children[0];

      robot.name = "robot";

      robot.position.set(160, 0, -40.0);
      robot.scale.set(25, 25, 25);
      robot.lookAt(new THREE.Vector3(1200, 0.0, -20.0));

      robot.visible = false;

      mixer = new THREE.AnimationMixer(gltf.scene);

      actions = {};

      for (let i = 0; i < gltf.animations.length; i++) {
        const clip = gltf.animations[i];
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;
      }

      scene.add(gltf.scene);
    }
  );
}

function resetRobot() {
  robot.visible = false;
  robot.position.set(160, 0, -40.0);
  robot.lookAt(new THREE.Vector3(1200, 0.0, -20.0));
  mixer.stopAllAction();
  mixer.update(clock.getDelta());
}

function moveRobotX(signal, delta, speed, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    let actualRobotPosition = robot.position;
    robot.position.set(
      actualRobotPosition.x + delta * speed * signal,
      actualRobotPosition.y,
      actualRobotPosition.z
    );
    actions["Walking"].play();
    activeAction = 1;
  }
}

function moveRobotY(signal, delta, speed, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    let actualRobotPosition = robot.position;
    robot.position.set(
      actualRobotPosition.x,
      actualRobotPosition.y + delta * speed * signal,
      actualRobotPosition.z
    );
    actions["ThumbsUp"].play();
    activeAction = 1;
  }
}

function moveRobotZ(signal, delta, speed, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    let actualRobotPosition = robot.position;
    robot.position.set(
      actualRobotPosition.x,
      actualRobotPosition.y,
      actualRobotPosition.z + delta * speed * signal
    );
    actions["Walking"].play();
    activeAction = 1;
  }
}

function robotLookAt(x, y, z, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    robot.lookAt(new THREE.Vector3(x, y, z));
    actions["Walking"].play();
    activeAction = 1;
  }
}

function robotAction(action, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    actions[action].play();
    activeAction = 1;
  }
}

function moveCameraTourForward(signal, delta, speed, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    camControl.moveForward(delta * speed * signal);
  }
}

function moveCameraTourRight(signal, delta, speed, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    camControl.moveRight(delta * speed * signal);
  }
}

function moveCameraTourUp(signal, delta, speed, initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < maxTime)) {
    camera.position.y += delta * speed * signal;
    camera.updateProjectionMatrix();
  }
}

function changeCameraTourLook(x, y, z, initTime) {
  let actual = tourClock.getElapsedTime();
  if ((actual > initTime) & (actual - initTime < 0.2)) {
    camera.lookAt(new THREE.Vector3(x, y, z));
    camera.updateProjectionMatrix();
  }
}

function unlockCameraTour(initTime, maxTime) {
  let actual = tourClock.getElapsedTime();
  if (actual > initTime) {
    if (actual - initTime < maxTime) camControl.pointerSpeed = 1;
    else camControl.pointerSpeed = 0;
  }
}

function resetTour(initTime) {
  let actual = tourClock.getElapsedTime();
  if (actual > initTime) {
    camControl.unlock();
  }
}

function buildScene() {
  var objMTL = new MTLLoader();
  objMTL.setPath("./Assets/Models/OBJ/sponza/");
  objMTL.load("sponza.mtl", loadMaterials);
}

/// ***************************************************************
/// **                                                           **
/// ***************************************************************

function loadMaterials(materials) {
  materials.preload();

  var objLoader = new OBJLoader();

  objLoader.setMaterials(materials);
  objLoader.setPath("./Assets/Models/OBJ/sponza/");
  objLoader.load("sponza.obj", loadMesh, onProgress);
}

/// ***************************************************************
/// **                                                           **
/// ***************************************************************

function loadMesh(object) {
  object.name = "cena";

  scene.add(object);

  ajusteCamera();
}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************
function ajusteCamera() {
  var obj = scene.getObjectByName("cena");

  const helper = new THREE.BoxHelper();
  helper.setFromObject(obj);

  helper.geometry.computeBoundingBox();

  const box = new THREE.Box3().setFromObject(obj);

  camera.position.x = -280.0;
  camera.position.y = 120.0;
  camera.position.z = -50.0;

  camera.lookAt(new THREE.Vector3(1200, 190.0, -20.0));

  var farPlane = Math.max(
    box.max.x - box.min.x,
    box.max.y - box.min.y,
    box.max.z - box.min.z
  );

  camera.far = farPlane * 10.0;
  camera.updateProjectionMatrix();

  const onKeyDown = function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;

      case "KeyA":
        moveLeft = true;
        break;

      case "KeyS":
        moveBackward = true;
        break;

      case "KeyD":
        moveRight = true;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;

      case "KeyA":
        moveLeft = false;
        break;

      case "KeyS":
        moveBackward = false;
        break;

      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  initCameraPe();
}

function initGUI() {
  var controls = { Passeio: "A pé" };

  gui
    .add(controls, "Passeio", ["A pé", "Drone", "Visita Guiada"])
    .onChange(changeCamera);
  gui.open();
}

function changeCamera(val) {
  camera.position.x = -280.0;
  camera.position.y = 120.0;
  camera.position.z = -50.0;

  camera.lookAt(new THREE.Vector3(1200, 190.0, -20.0));
  camera.updateProjectionMatrix();
  if (val == "A pé") initCameraPe();
  else if (val == "Drone") initCameraDrone();
  else if (val == "Visita Guiada") initCameraVisita();
}

function initCameraPe() {
  resetRobot();
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  if (typeCamera == "Visita Guiada") camControl.disconnect();

  typeCamera = "A pé";

  //Controle de Camera Visia a Pe
  camControl = new PointerLockControls(camera, document.body);

  camControl.pointerSpeed = 1.0;
  const menu = document.getElementById("menu");
  const info = document.getElementById("info");

  menu.style.display = "block";
  info.style.display = "none";

  menu.addEventListener("click", function () {
    camControl.lock();
  });

  camControl.addEventListener("lock", function () {
    menu.style.display = "none";
  });

  camControl.addEventListener("unlock", function () {
    menu.style.display = "block";
  });
}

function initCameraDrone() {
  resetRobot();
  const menu = document.getElementById("menu");
  const info = document.getElementById("info");
  menu.style.display = "none";
  menu.removeEventListener("click", function () {
    camControl.lock();
  });
  info.removeEventListener("click", function () {
    camControl.lock();
  });
  info.innerHTML =
    " (Mouse Left | W) - Move Forward ; (Mouse Right | S) - Move Backward; (A | D) - Move Left | Move Right ";
  info.style.display = "block";
  camControl.disconnect();
  typeCamera = "Drone";
  camControl = new FirstPersonControls(camera, document.body);
  camControl.movementSpeed = 150;
  camControl.lookSpeed = 0.1;
}

function initCameraVisita() {
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  if (typeCamera == "A pé") camControl.disconnect();
  typeCamera = "Visita Guiada";
  robot.visible = true;

  //Controle de Camera Visia a Pe
  camControl = new PointerLockControls(camera, document.body);

  const menu = document.getElementById("menu");
  const info = document.getElementById("info");

  menu.style.display = "none";
  info.style.display = "block";
  info.innerHTML = " Click to start ";

  info.addEventListener("click", function () {
    camControl.lock();
  });

  camControl.addEventListener("lock", function () {
    info.style.display = "none";
  });

  camControl.addEventListener("unlock", function () {
    info.style.display = "block";
    camera.position.x = -280.0;
    camera.position.y = 120.0;
    camera.position.z = -50.0;

    camera.lookAt(new THREE.Vector3(1200, 190.0, -20.0));
    camera.updateProjectionMatrix();

    resetRobot();
    robot.visible = true;
    renderer.render(scene, camera);
    camControl.pointerSpeed = 0.0;
    oldTime = 0;
  });

  camControl.pointerSpeed = 0.0;
  activeAction = 0;
}

function render() {
  requestAnimationFrame(render);
  if (typeCamera != "Visita Guiada") {
    let delta = clock.getDelta();
    try {
      //console.log(camera.position.x, camera.position.y, camera.position.z);
      if ((typeCamera == "A pé") & camControl.isLocked) {
        const movement = 170 * delta;
        if (moveForward) camControl.moveForward(movement);
        if (moveBackward) camControl.moveForward(-movement);
        if (moveLeft) camControl.moveRight(-movement);
        if (moveRight) camControl.moveRight(movement);
      }

      if (camera.position.x >= 1200.0) camera.position.x = 1200.0;
      else if (camera.position.x <= -1320.0) camera.position.x = -1320.0;
      if (camera.position.y >= 2030.0) camera.position.y = 2030.0;
      else if (camera.position.y <= 4) camera.position.y = 4;
      if (camera.position.z >= 565.0) camera.position.z = 565.0;
      else if (camera.position.z <= -640.0) camera.position.z = -640.0;

      camControl.update(delta);
      renderer.render(scene, camera);
    } catch {
      renderer.render(scene, camera);
    }
  } else {
    if (camControl.isLocked) {
      if (oldTime == 0) {
        tourClock = new THREE.Clock();
        oldTime = 1;
      }
      let delta = tourClock.getDelta();
      moveRobotX(1, delta, 50, 0, 5);
      moveCameraTourForward(1, delta, 50, 0, 5);
      robotLookAt(robot.position.x, robot.position.y, -50, 5, 0.5);
      moveRobotZ(-1, delta, 50, 6, 2);
      robotLookAt(robot.position.x, robot.position.y, 50, 8, 0.5);
      robotAction("Idle", 9.5, 5);
      moveCameraTourForward(1, delta, 50, 9.5, 3);
      moveCameraTourRight(1, delta, 50, 12.5, 2);
      changeCameraTourLook(580, 120, -250, 14.5);
      robotAction("Wave", 14.5, 10.5);
      unlockCameraTour(14.6, 10.4);
      changeCameraTourLook(1200, 190.0, 110.0, 25);
      moveCameraTourRight(-1, delta, 50, 25, 2);
      moveCameraTourForward(-1, delta, 50, 27, 3);
      moveRobotZ(1, delta, 50, 30, 2);
      robotLookAt(1200, robot.position.y, robot.position.z, 32, 0.5);
      moveRobotX(1, delta, 50, 33, 15);
      moveCameraTourForward(1, delta, 50, 33, 15);
      robotLookAt(0.0, robot.position.y, robot.position.z, 49, 0.5);
      robotAction("Wave", 51, 10);
      unlockCameraTour(51.1, 10);
      changeCameraTourLook(1200, 120.0, -20.0, 61.3);
      moveRobotX(-1, delta, 50, 62, 10);
      moveCameraTourForward(-1, delta, 50, 62.1, 10);
      robotAction("ThumbsUp", 72.1, 2.3);
      moveRobotY(1, delta, 50, 74.5, 10);
      moveCameraTourUp(1, delta, 50, 74.5, 10);
      robotAction("Wave", 86, 10);
      unlockCameraTour(86, 10);
      changeCameraTourLook(1200, 615.0, -20.0, 96.5);
      moveRobotY(1, delta, 50, 97, 20);
      moveCameraTourUp(1, delta, 50, 97, 20);
      robotLookAt(1200, robot.position.y, robot.position.z, 118, 0.5);
      moveRobotX(1, delta, 50, 118.5, 3);
      robotLookAt(0.0, robot.position.y, robot.position.z, 122, 0.5);
      robotAction("Dance", 123, 20);
      unlockCameraTour(123, 20);
      changeCameraTourLook(1200, 1400, -20.0, 144);
      robotAction("Wave", 145, 1);
      resetTour(146);

      if (!activeAction) mixer.stopAllAction();
      activeAction = 0;
      mixer.update(delta);
      renderer.render(scene, camera);
    } else {
      renderer.render(scene, camera);
    }
  }
}

/// ***************************************************************
/// ***************************************************************
/// ***************************************************************

main();
