// Main Game Engine & Controller for Parking BMM_UZ
class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.state = 'MAIN_MENU'; // 'MAIN_MENU', 'GARAGE', 'PLAYING', 'PAUSED'

    // Selected car state
    this.selectedCarIndex = 0;
    this.selectedCarConfig = UZ_CARS[0];
    this.selectedColorHex = UZ_CARS[0].defaultColor;

    // Game stats & scoring
    this.score = 0;
    this.parkCount = 0;
    this.streak = 0;
    this.currentMissionTime = 0;
    this.activeSpot = null;
    this.parkingHoldTime = 0;
    this.requiredHoldTime = 1.8; // seconds

    // Input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false
    };

    // Camera modes: 0: 3rd person chase, 1: Hood/cockpit, 2: Overhead parking cam
    this.cameraMode = 0;

    // Three.js primitives
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Game systems
    this.city = null;
    this.traffic = null;
    this.physics = null;
    this.playerCarMesh = null;
    this.garageCarMesh = null;
    this.navArrow = null;

    // Minimap canvas
    this.miniCanvas = document.getElementById('minimap-canvas');
    this.miniCtx = this.miniCanvas ? this.miniCanvas.getContext('2d') : null;

    // Bindings
    this.animate = this.animate.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  init() {
    this.setupThree();
    this.setupCityAndTraffic();
    this.setupGarageCar();
    this.setupNavArrow();
    this.setupInputListeners();
    this.setupUIListeners();
    this.loadRecords();

    window.addEventListener('resize', this.onResize);
    requestAnimationFrame(this.animate);
  }

  setupThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Day/evening Tashkent sky
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 800);
    this.camera.position.set(0, 15, 30);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(80, 140, 70);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 350;
    const shadowD = 120;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    this.scene.add(dirLight);
    this.dirLight = dirLight;

    // Hemisphere light for natural ambient bounce
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d434d, 0.45);
    this.scene.add(hemiLight);
  }

  setupCityAndTraffic() {
    this.cityBuilder = new CityBuilder(this.scene);
    this.cityData = this.cityBuilder.build();

    // Autonomous traffic
    this.traffic = new TrafficManager(this.scene, this.cityData.trafficWaypoints);
    this.traffic.init();
  }

  setupNavArrow() {
    // 3D Navigation arrow hovering above car
    const arrowGeo = new THREE.ConeGeometry(0.5, 1.4, 8);
    arrowGeo.rotateX(Math.PI); // Point down
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
    this.navArrow = new THREE.Mesh(arrowGeo, arrowMat);
    this.navArrow.position.set(0, 3.8, 0);
    this.navArrow.visible = false;
    this.scene.add(this.navArrow);
  }

  setupGarageCar() {
    if (this.garageCarMesh) {
      this.scene.remove(this.garageCarMesh);
    }
    this.selectedCarConfig = UZ_CARS[this.selectedCarIndex];
    this.garageCarMesh = CarModelFactory.createCar(this.selectedCarConfig, this.selectedColorHex);
    this.garageCarMesh.position.set(0, 0, 0);
    this.scene.add(this.garageCarMesh);
  }

  spawnPlayerCar() {
    if (this.playerCarMesh) {
      this.scene.remove(this.playerCarMesh);
    }
    this.selectedCarConfig = UZ_CARS[this.selectedCarIndex];
    this.playerCarMesh = CarModelFactory.createCar(this.selectedCarConfig, this.selectedColorHex);

    // Initial spawn point on the open right lane of central avenue
    this.playerCarMesh.position.set(3.8, 0, 20);
    this.scene.add(this.playerCarMesh);

    this.physics = new VehiclePhysics(this.selectedCarConfig, this.cityData.colliders);
    this.physics.setCarMesh(this.playerCarMesh, this.selectedCarConfig);
    this.physics.resetPosition(3.8, 20, 0);

    // Assign first parking mission
    this.assignNewParkingMission();
  }

  assignNewParkingMission() {
    const spots = this.cityData.parkingSpots;
    if (!spots || spots.length === 0) return;

    // Pick a spot different from current
    let nextSpot;
    do {
      nextSpot = spots[Math.floor(Math.random() * spots.length)];
    } while (spots.length > 1 && this.activeSpot && nextSpot.id === this.activeSpot.id);

    this.activeSpot = nextSpot;
    this.parkingHoldTime = 0;
    this.currentMissionTime = 0;

    // Update mission HUD
    const targetLabel = document.getElementById('mission-target-name');
    if (targetLabel) targetLabel.textContent = this.activeSpot.name;

    // Highlight beacon
    spots.forEach(s => {
      if (s.beacon) s.beacon.visible = (s.id === this.activeSpot.id);
    });

    if (this.navArrow) this.navArrow.visible = true;
  }

  setupInputListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mobile / On-screen Touch Controls
    const bindTouch = (elemId, keyProp) => {
      const el = document.getElementById(elemId);
      if (!el) return;
      const setTrue = (e) => { e.preventDefault(); this.input[keyProp] = true; };
      const setFalse = (e) => { e.preventDefault(); this.input[keyProp] = false; };
      el.addEventListener('touchstart', setTrue);
      el.addEventListener('touchend', setFalse);
      el.addEventListener('mousedown', setTrue);
      el.addEventListener('mouseup', setFalse);
      el.addEventListener('mouseleave', setFalse);
    };

    bindTouch('btn-gas', 'forward');
    bindTouch('btn-brake', 'backward');
    bindTouch('btn-left', 'left');
    bindTouch('btn-right', 'right');
    bindTouch('btn-handbrake', 'handbrake');
  }

  onKeyDown(e) {
    if (this.state !== 'PLAYING') return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = true;
        break;
      case 'Space':
        this.input.handbrake = true;
        e.preventDefault();
        break;
      case 'KeyH':
        window.soundEngine.playHorn();
        break;
      case 'KeyC':
        this.toggleCameraMode();
        break;
      case 'KeyR':
        this.resetPlayerCar();
        break;
      case 'Escape':
        this.openMainMenu();
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = false;
        break;
      case 'Space':
        this.input.handbrake = false;
        break;
    }
  }

  toggleCameraMode() {
    this.cameraMode = (this.cameraMode + 1) % 3;
    window.soundEngine.playClick();
  }

  resetPlayerCar() {
    if (!this.playerCarMesh || !this.physics) return;
    const curX = this.playerCarMesh.position.x;
    const curZ = this.playerCarMesh.position.z;
    const avenues = (this.cityData && this.cityData.trafficWaypoints) ? this.cityData.trafficWaypoints.avenues : [0];

    // Find closest NS avenue (along X) and EW avenue (along Z)
    let closestX = avenues[0];
    let minDx = Math.abs(curX - avenues[0]);
    avenues.forEach(av => {
      const d = Math.abs(curX - av);
      if (d < minDx) { minDx = d; closestX = av; }
    });

    let closestZ = avenues[0];
    let minDz = Math.abs(curZ - avenues[0]);
    avenues.forEach(av => {
      const d = Math.abs(curZ - av);
      if (d < minDz) { minDz = d; closestZ = av; }
    });

    // Snap to whichever avenue is closer and place on open lane
    if (minDx < minDz) {
      this.physics.resetPosition(closestX + 3.8, curZ, 0);
    } else {
      this.physics.resetPosition(curX, closestZ + 3.8, Math.PI / 2);
    }
  }

  setupUIListeners() {
    // Main Menu Buttons
    document.getElementById('btn-play').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.startGame();
    });

    document.getElementById('btn-garage').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openGarage();
    });

    document.getElementById('btn-records').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openRecordsModal();
    });

    document.getElementById('btn-help').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openHelpModal();
    });

    // Garage Nav
    document.getElementById('garage-prev-car').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.prevCar();
    });

    document.getElementById('garage-next-car').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.nextCar();
    });

    document.getElementById('garage-back-btn').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openMainMenu();
    });

    document.getElementById('garage-drive-btn').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.startGame();
    });

    // In-game HUD buttons
    document.getElementById('hud-horn-btn').addEventListener('click', () => {
      window.soundEngine.playHorn();
    });

    document.getElementById('hud-cam-btn').addEventListener('click', () => {
      this.toggleCameraMode();
    });

    document.getElementById('hud-menu-btn').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openMainMenu();
    });

    // Close buttons for modals
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.closeAllModals();
      });
    });
  }

  startGame() {
    this.state = 'PLAYING';
    this.closeAllScreens();
    document.getElementById('hud-view').classList.add('active');

    if (this.garageCarMesh) {
      this.scene.remove(this.garageCarMesh);
      this.garageCarMesh = null;
    }

    this.spawnPlayerCar();
    window.soundEngine.startEngine();
  }

  openMainMenu() {
    this.state = 'MAIN_MENU';
    window.soundEngine.stopEngine();

    this.closeAllScreens();
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('hud-view').classList.remove('active');

    if (!this.garageCarMesh) {
      this.setupGarageCar();
    }
  }

  openGarage() {
    this.state = 'GARAGE';
    this.closeAllScreens();
    document.getElementById('garage-menu').classList.add('active');

    if (!this.garageCarMesh) {
      this.setupGarageCar();
    }
    this.updateGarageUI();
  }

  prevCar() {
    this.selectedCarIndex = (this.selectedCarIndex - 1 + UZ_CARS.length) % UZ_CARS.length;
    this.selectedCarConfig = UZ_CARS[this.selectedCarIndex];
    this.selectedColorHex = this.selectedCarConfig.defaultColor;
    this.setupGarageCar();
    this.updateGarageUI();
  }

  nextCar() {
    this.selectedCarIndex = (this.selectedCarIndex + 1) % UZ_CARS.length;
    this.selectedCarConfig = UZ_CARS[this.selectedCarIndex];
    this.selectedColorHex = this.selectedCarConfig.defaultColor;
    this.setupGarageCar();
    this.updateGarageUI();
  }

  updateGarageUI() {
    const car = this.selectedCarConfig;
    document.getElementById('garage-car-name').textContent = car.name;
    document.getElementById('garage-car-badge').textContent = car.badge;
    document.getElementById('garage-car-desc').textContent = car.desc;

    // Stat bars
    document.getElementById('stat-speed-val').textContent = car.stats.speed + '%';
    document.getElementById('stat-speed-bar').style.width = car.stats.speed + '%';

    document.getElementById('stat-accel-val').textContent = car.stats.accel + '%';
    document.getElementById('stat-accel-bar').style.width = car.stats.accel + '%';

    document.getElementById('stat-handling-val').textContent = car.stats.handling + '%';
    document.getElementById('stat-handling-bar').style.width = car.stats.handling + '%';

    document.getElementById('stat-brake-val').textContent = car.stats.brake + '%';
    document.getElementById('stat-brake-bar').style.width = car.stats.brake + '%';

    // Color picker dots
    const dotsContainer = document.getElementById('garage-color-dots');
    dotsContainer.innerHTML = '';
    car.colors.forEach((c) => {
      const dot = document.createElement('div');
      dot.className = `color-dot ${c.hex === this.selectedColorHex ? 'active' : ''}`;
      dot.style.backgroundColor = '#' + c.hex.toString(16).padStart(6, '0');
      dot.title = c.name;
      dot.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.selectedColorHex = c.hex;
        CarModelFactory.setCarColor(this.garageCarMesh, c.hex);
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
      dotsContainer.appendChild(dot);
    });
  }

  openRecordsModal() {
    this.renderRecords();
    document.getElementById('records-modal').classList.add('active');
  }

  openHelpModal() {
    document.getElementById('help-modal').classList.add('active');
  }

  closeAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.closeAllModals();
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  loadRecords() {
    try {
      const saved = localStorage.getItem('parking_bmm_uz_records');
      if (saved) {
        this.records = JSON.parse(saved);
      } else {
        // Default Uzbek high scores
        this.records = [
          { rank: 1, car: 'Malibu 2 Turbo', score: 3200, parks: 8, date: '15.10.2026' },
          { rank: 2, car: 'Gentra Qorabayir', score: 2600, parks: 6, date: '14.10.2026' },
          { rank: 3, car: 'Cobalt LTZ', score: 1950, parks: 5, date: '12.10.2026' },
          { rank: 4, car: 'Nexia 3', score: 1400, parks: 4, date: '10.10.2026' },
          { rank: 5, car: 'Damas Delux', score: 980, parks: 3, date: '08.10.2026' }
        ];
        this.saveRecords();
      }
    } catch (e) {
      console.warn("Records load error:", e);
    }
  }

  saveRecords() {
    try {
      localStorage.setItem('parking_bmm_uz_records', JSON.stringify(this.records));
    } catch (e) {}
  }

  addRecord(score, parks) {
    const today = new Date().toLocaleDateString('uz-UZ');
    this.records.push({
      car: this.selectedCarConfig.name,
      score: score,
      parks: parks,
      date: today
    });
    // Sort descending by score
    this.records.sort((a, b) => b.score - a.score);
    this.records = this.records.slice(0, 10);
    this.records.forEach((r, idx) => r.rank = idx + 1);
    this.saveRecords();
  }

  renderRecords() {
    const container = document.getElementById('records-list-container');
    if (!container) return;
    container.innerHTML = '';

    this.records.forEach(rec => {
      const item = document.createElement('div');
      item.className = 'record-item';

      let rankClass = '';
      if (rec.rank === 1) rankClass = 'gold';
      else if (rec.rank === 2) rankClass = 'silver';
      else if (rec.rank === 3) rankClass = 'bronze';

      item.innerHTML = `
        <div class="record-rank ${rankClass}">#${rec.rank}</div>
        <div class="record-info">
          <div class="record-car">${rec.car}</div>
          <div class="record-date">${rec.date} • ${rec.parks} ta parkovka</div>
        </div>
        <div class="record-value">
          <div class="record-score">${rec.score} ball</div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  checkParkingEvaluation(dt) {
    if (!this.activeSpot || !this.playerCarMesh || !this.physics) return;

    const carPos = this.playerCarMesh.position;
    const spot = this.activeSpot;

    // Vector to spot center
    const dx = carPos.x - spot.x;
    const dz = carPos.z - spot.z;
    const distToCenter = Math.sqrt(dx * dx + dz * dz);

    // Audio parking sensor beep when close
    if (distToCenter < 12) {
      window.soundEngine.playParkBeep(distToCenter);
    }

    // Alignment angle (either forward or reverse parking is accepted)
    const carRot = this.playerCarMesh.rotation.y;
    let angleDiff = Math.abs(carRot - spot.rotation) % Math.PI;
    if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff;
    const isAngleGood = angleDiff < 0.28; // ~16 degrees

    // Boundary check
    const isInside = distToCenter < (spot.length * 0.42);
    const isStopped = Math.abs(this.physics.speed) < 0.35;

    const assistBar = document.getElementById('parking-assist-bar');
    const distLabel = document.getElementById('assist-dist-val');
    const angleLabel = document.getElementById('assist-angle-val');
    const holdFill = document.getElementById('assist-hold-fill');

    if (distToCenter < 14) {
      if (assistBar) assistBar.classList.add('visible');
      if (distLabel) distLabel.textContent = `${distToCenter.toFixed(1)} m`;
      if (angleLabel) angleLabel.textContent = isAngleGood ? 'To\'g\'ri ✓' : 'Burchakni to\'g\'rilang';

      if (isInside && isAngleGood && isStopped) {
        this.parkingHoldTime += dt;
        const progress = Math.min(100, (this.parkingHoldTime / this.requiredHoldTime) * 100);
        if (holdFill) holdFill.style.width = `${progress}%`;

        if (this.parkingHoldTime >= this.requiredHoldTime) {
          this.onParkingSuccess();
        }
      } else {
        this.parkingHoldTime = Math.max(0, this.parkingHoldTime - dt * 2);
        if (holdFill) holdFill.style.width = `${(this.parkingHoldTime / this.requiredHoldTime) * 100}%`;
      }
    } else {
      if (assistBar) assistBar.classList.remove('visible');
      this.parkingHoldTime = 0;
    }
  }

  onParkingSuccess() {
    this.parkingHoldTime = 0;
    this.parkCount++;
    this.streak++;

    // Calculate score based on speed and streak
    const basePoints = 500;
    const streakBonus = this.streak * 100;
    const pointsGained = basePoints + streakBonus;
    this.score += pointsGained;

    // Play victory sound
    window.soundEngine.playSuccess();

    // Show toast banner
    const toast = document.getElementById('parking-success-toast');
    const toastPoints = document.getElementById('toast-points-text');
    if (toast && toastPoints) {
      toastPoints.textContent = `+${pointsGained} Ball! (Streak: x${this.streak})`;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    // Update HUD
    const hudScore = document.getElementById('hud-score-val');
    const hudPark = document.getElementById('hud-parks-val');
    const hudStreak = document.getElementById('hud-streak-val');
    if (hudScore) hudScore.textContent = this.score;
    if (hudPark) hudPark.textContent = this.parkCount;
    if (hudStreak) hudStreak.textContent = `x${this.streak}`;

    this.addRecord(this.score, this.parkCount);

    // Give next spot
    this.assignNewParkingMission();
  }

  updateCamera() {
    if (this.state === 'MAIN_MENU') {
      // Gentle cinematic orbit
      const time = this.clock.getElapsedTime() * 0.2;
      this.camera.position.x = Math.sin(time) * 14;
      this.camera.position.z = Math.cos(time) * 14;
      this.camera.position.y = 5;
      this.camera.lookAt(0, 1.2, 0);
    } else if (this.state === 'GARAGE') {
      // Garage view rotating smoothly
      const time = this.clock.getElapsedTime() * 0.3;
      this.camera.position.x = Math.sin(time) * 6.5;
      this.camera.position.z = Math.cos(time) * 6.5;
      this.camera.position.y = 2.4;
      this.camera.lookAt(0, 0.8, 0);
    } else if (this.state === 'PLAYING' && this.playerCarMesh) {
      const carPos = this.playerCarMesh.position;
      const carRot = this.playerCarMesh.rotation.y;

      if (this.cameraMode === 0) {
        // Chase cam
        const dist = 7.5;
        const height = 3.6;
        const camX = carPos.x - Math.sin(carRot) * dist;
        const camZ = carPos.z - Math.cos(carRot) * dist;
        const camY = carPos.y + height;

        this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
        this.camera.lookAt(carPos.x, carPos.y + 1.2, carPos.z);
      } else if (this.cameraMode === 1) {
        // Hood / Cockpit cam
        const hoodX = carPos.x + Math.sin(carRot) * 0.8;
        const hoodZ = carPos.z + Math.cos(carRot) * 0.8;
        const hoodY = carPos.y + 1.2;

        this.camera.position.set(hoodX, hoodY, hoodZ);
        const lookX = carPos.x + Math.sin(carRot) * 20;
        const lookZ = carPos.z + Math.cos(carRot) * 20;
        this.camera.lookAt(lookX, carPos.y + 1.0, lookZ);
      } else if (this.cameraMode === 2) {
        // Overhead Parking Cam
        const overheadY = 18;
        this.camera.position.lerp(new THREE.Vector3(carPos.x, overheadY, carPos.z), 0.15);
        this.camera.lookAt(carPos.x, 0, carPos.z);
      }

      // Update Nav Arrow position and orientation
      if (this.navArrow && this.activeSpot) {
        this.navArrow.position.set(carPos.x, carPos.y + 3.8, carPos.z);
        // Point nav arrow toward active parking spot
        this.navArrow.lookAt(this.activeSpot.x, carPos.y + 3.8, this.activeSpot.z);
        this.navArrow.rotateX(Math.PI / 2); // Cone orientation
      }
    }
  }

  updateMinimap() {
    if (!this.miniCtx || this.state !== 'PLAYING' || !this.playerCarMesh) return;
    const ctx = this.miniCtx;
    const w = this.miniCanvas.width;
    const h = this.miniCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 1.1; // meters to pixels

    ctx.clearRect(0, 0, w, h);

    const px = this.playerCarMesh.position.x;
    const pz = this.playerCarMesh.position.z;
    const pRot = this.playerCarMesh.rotation.y;

    // Draw Roads around player
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 14;
    this.cityData.trafficWaypoints.avenues.forEach(av => {
      // EW roads
      const mapY = cy + (av - pz) * scale;
      ctx.beginPath();
      ctx.moveTo(0, mapY);
      ctx.lineTo(w, mapY);
      ctx.stroke();

      // NS roads
      const mapX = cx + (av - px) * scale;
      ctx.beginPath();
      ctx.moveTo(mapX, 0);
      ctx.lineTo(mapX, h);
      ctx.stroke();
    });

    // Draw Active Parking Spot Target
    if (this.activeSpot) {
      const spotMapX = cx + (this.activeSpot.x - px) * scale;
      const spotMapY = cy + (this.activeSpot.z - pz) * scale;

      ctx.fillStyle = '#00e676';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(spotMapX, spotMapY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('PARK', spotMapX + 8, spotMapY + 3);
    }

    // Draw Traffic Cars
    const trafficCars = this.traffic.getTrafficPositions();
    ctx.fillStyle = '#ff9800';
    trafficCars.forEach(tc => {
      const tx = cx + (tc.x - px) * scale;
      const ty = cy + (tc.z - pz) * scale;
      if (tx >= 0 && tx <= w && ty >= 0 && ty <= h) {
        ctx.beginPath();
        ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Player Car (in center, green arrow)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-pRot);

    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 4);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  updateHUD() {
    if (this.state !== 'PLAYING' || !this.physics) return;

    const speed = this.physics.getSpeedKmh();
    const speedEl = document.getElementById('speed-number');
    const gearEl = document.getElementById('gear-indicator');

    if (speedEl) speedEl.textContent = Math.abs(speed);
    if (gearEl) gearEl.textContent = this.physics.gear;

    // Engine sound pitch & volume update
    window.soundEngine.updateEngine(speed, this.input.forward || this.input.backward);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING') {
      // Physics & Player
      if (this.physics) {
        this.physics.update(dt, this.input);
      }
      // Autonomous Traffic
      if (this.traffic) {
        this.traffic.update(dt, this.playerCarMesh);
      }
      // Parking Evaluation
      this.checkParkingEvaluation(dt);
      // HUD & Radar
      this.updateHUD();
      this.updateMinimap();
    } else if (this.state === 'GARAGE' && this.garageCarMesh) {
      // Gentle car rotation in garage
      this.garageCarMesh.rotation.y += dt * 0.45;
    }

    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.init();
});
