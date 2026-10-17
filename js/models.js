// Uzbek Cars 3D Models & Specs for Parking BMM_UZ
const UZ_CARS = [
  {
    id: 'gentra',
    name: 'Gentra / Lacetti',
    badge: '★ Qorabayir Style ★',
    desc: 'O\'zbekistondagi eng mashhur va obro\'li sedan. Tejamkor va boshqaruvga oson.',
    stats: { speed: 85, accel: 80, handling: 82, brake: 85 },
    specs: { maxSpeed: 140, acceleration: 28, turnSpeed: 2.3, brakePower: 38 },
    dimensions: { length: 4.5, width: 1.8, height: 1.45 },
    defaultColor: 0x111111, // Qora Gentra
    colors: [
      { name: 'Qora (Qorabayir)', hex: 0x111111 },
      { name: 'Oq (Marvarid)', hex: 0xf8f9fa },
      { name: 'Mokriy Asfalt', hex: 0x475569 },
      { name: 'To\'q Ko\'k', hex: 0x0f2b48 }
    ],
    plate: '01 | 777 BMM'
  },
  {
    id: 'cobalt',
    name: 'Cobalt LTZ',
    badge: 'Xalq sevgan avto',
    desc: 'Keng salon, baland klirens va har qanday shahar ko\'chalariga mos mustahkam avtomobil.',
    stats: { speed: 80, accel: 75, handling: 78, brake: 82 },
    specs: { maxSpeed: 135, acceleration: 26, turnSpeed: 2.2, brakePower: 36 },
    dimensions: { length: 4.48, width: 1.78, height: 1.51 },
    defaultColor: 0xf0f2f5, // Oq
    colors: [
      { name: 'Oq marvarid', hex: 0xf0f2f5 },
      { name: 'Kumushrang', hex: 0xc0c8d0 },
      { name: 'Mokriy Asfalt', hex: 0x3d434d },
      { name: 'Qora', hex: 0x1a1a1a }
    ],
    plate: '01 | 111 CBL'
  },
  {
    id: 'nexia3',
    name: 'Nexia 3 (Ravon R3)',
    badge: 'Chaqqon va shiddatkor',
    desc: 'Kichikroq o\'lcham va chaqqon burilish – tor ko\'chalarda va parkovkada tengsiz!',
    stats: { speed: 82, accel: 85, handling: 88, brake: 80 },
    specs: { maxSpeed: 138, acceleration: 29, turnSpeed: 2.45, brakePower: 36 },
    dimensions: { length: 4.33, width: 1.73, height: 1.50 },
    defaultColor: 0xffffff,
    colors: [
      { name: 'Oq', hex: 0xffffff },
      { name: 'Qizil metallik', hex: 0xad1457 },
      { name: 'Kumush', hex: 0xbdc3c7 },
      { name: 'Qora', hex: 0x151515 }
    ],
    plate: '01 | 333 NEX'
  },
  {
    id: 'damas',
    name: 'Damas Van (Delux)',
    badge: 'Afsonaviy O\'zbek mehnatkashi',
    desc: 'Haqiqiy afsona! Baland o\'tirish, o\'ziga xos yashil chiziq va ajoyib sig\'im.',
    stats: { speed: 65, accel: 60, handling: 70, brake: 72 },
    specs: { maxSpeed: 110, acceleration: 20, turnSpeed: 2.1, brakePower: 32 },
    dimensions: { length: 3.48, width: 1.55, height: 1.92 },
    defaultColor: 0xf5f6fa,
    colors: [
      { name: 'Klassik Oq (Yashil belbog\')', hex: 0xf5f6fa },
      { name: 'Kumush', hex: 0xdcdde1 },
      { name: 'Och ko\'k', hex: 0x74b9ff }
    ],
    plate: '01 | 010 DMS'
  },
  {
    id: 'malibu2',
    name: 'Malibu 2 Turbo',
    badge: 'VIP Biznes Klass',
    desc: 'Yuqori quvvatli turbo motor, premium qulaylik va eng tezkor dinamika.',
    stats: { speed: 96, accel: 95, handling: 90, brake: 95 },
    specs: { maxSpeed: 165, acceleration: 38, turnSpeed: 2.4, brakePower: 45 },
    dimensions: { length: 4.92, width: 1.86, height: 1.46 },
    defaultColor: 0x0a0c10, // Premium Qora
    colors: [
      { name: 'Prezident Qora', hex: 0x0a0c10 },
      { name: 'Oq Marvarid', hex: 0xf7f9fa },
      { name: 'To\'q Kulrang', hex: 0x2f3640 },
      { name: 'To\'q Qizil Ruby', hex: 0x800000 }
    ],
    plate: '01 | 001 UZB'
  },
  {
    id: 'spark',
    name: 'Spark / Matiz City',
    badge: 'Parkovka Qiroli',
    desc: 'Eng kichik radiusli burilish va minimal hajm – har qanday tor joyga osongina parkovka qilasiz.',
    stats: { speed: 75, accel: 80, handling: 96, brake: 84 },
    specs: { maxSpeed: 125, acceleration: 26, turnSpeed: 2.7, brakePower: 38 },
    dimensions: { length: 3.64, width: 1.62, height: 1.52 },
    defaultColor: 0x00cec9, // Firuza / Moviy
    colors: [
      { name: 'Moviy firuza', hex: 0x00cec9 },
      { name: 'Oq', hex: 0xffffff },
      { name: 'Och sariq', hex: 0xfdcb6e },
      { name: 'Yorqin Qizil', hex: 0xd63031 }
    ],
    plate: '01 | 555 SPK'
  }
];

class CarModelFactory {
  // Common reusable materials
  static getWheelMaterial() {
    return new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.1 });
  }

  static getRimMaterial() {
    return new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.3, metalness: 0.85 });
  }

  static getGlassMaterial(isTinted = false) {
    return new THREE.MeshPhysicalMaterial({
      color: isTinted ? 0x111115 : 0x334455,
      transparent: true,
      opacity: isTinted ? 0.88 : 0.65,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.2
    });
  }

  static getHeadlightMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffee,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
  }

  static getTaillightMaterial(isBraking = false) {
    return new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      emissive: 0xff0000,
      emissiveIntensity: isBraking ? 1.5 : 0.4,
      roughness: 0.3
    });
  }

  static createWheel(radius = 0.35, width = 0.25) {
    const wheelGroup = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 18);
    const tire = new THREE.Mesh(tireGeo, this.getWheelMaterial());
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 12);
    const rim = new THREE.Mesh(rimGeo, this.getRimMaterial());
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Center hub cap
    const hubGeo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, width + 0.04, 8);
    const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 }));
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    return wheelGroup;
  }

  static createLicensePlate(text = '01 | 777 BMM') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Plate background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 64);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 60);

    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 130, 32);

    // Uzbekistan mini flag stripe on left
    ctx.fillStyle = '#0099b5';
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = '#1eb53a';
    ctx.fillRect(8, 24, 16, 16);

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(0.5, 0.14);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geo, mat);
  }

  // BUILD A CAR BY MODEL ID
  static createCar(carConfig, customColorHex = null) {
    const root = new THREE.Group();
    const colorHex = customColorHex !== null ? customColorHex : carConfig.defaultColor;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.6,
      roughness: 0.35
    });

    const dim = carConfig.dimensions;
    const L = dim.length;
    const W = dim.width;
    const H = dim.height;

    const taillights = [];
    let wheels = [];

    if (carConfig.id === 'damas') {
      // DAMAS VAN - Unique Microvan Architecture
      // Main Van Body Box
      const bodyGeo = new THREE.BoxGeometry(W, H * 0.72, L);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = H * 0.52;
      body.castShadow = true;
      root.add(body);

      // Distinctive Green Stripe (Belbog')
      const stripeGeo = new THREE.BoxGeometry(W + 0.02, 0.12, L * 0.98);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x009944, roughness: 0.4 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = H * 0.45;
      root.add(stripe);

      // Flat front windshield
      const windGeo = new THREE.PlaneGeometry(W * 0.85, H * 0.42);
      const windMat = this.getGlassMaterial(false);
      const windshield = new THREE.Mesh(windGeo, windMat);
      windshield.position.set(0, H * 0.72, L * 0.485);
      root.add(windshield);

      // Rear window
      const rearWin = new THREE.Mesh(windGeo, this.getGlassMaterial(true));
      rearWin.rotation.y = Math.PI;
      rearWin.position.set(0, H * 0.72, -L * 0.485);
      root.add(rearWin);

      // Side windows
      const sideWinGeo = new THREE.PlaneGeometry(L * 0.7, H * 0.35);
      const sideWinL = new THREE.Mesh(sideWinGeo, this.getGlassMaterial(true));
      sideWinL.rotation.y = -Math.PI / 2;
      sideWinL.position.set(-W * 0.505, H * 0.72, 0);
      root.add(sideWinL);

      const sideWinR = new THREE.Mesh(sideWinGeo, this.getGlassMaterial(true));
      sideWinR.rotation.y = Math.PI / 2;
      sideWinR.position.set(W * 0.505, H * 0.72, 0);
      root.add(sideWinR);

      // Front bumper
      const bumperGeo = new THREE.BoxGeometry(W * 1.02, 0.22, 0.25);
      const bumperMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
      const f_bumper = new THREE.Mesh(bumperGeo, bumperMat);
      f_bumper.position.set(0, 0.26, L * 0.51);
      root.add(f_bumper);

      // Headlights (Round-ish)
      const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
      hlGeo.rotateX(Math.PI / 2);
      const hlMat = this.getHeadlightMaterial();
      const hlL = new THREE.Mesh(hlGeo, hlMat);
      hlL.position.set(-W * 0.32, H * 0.38, L * 0.505);
      const hlR = hlL.clone();
      hlR.position.x = W * 0.32;
      root.add(hlL, hlR);

      // Taillights
      const tlGeo = new THREE.BoxGeometry(0.12, 0.24, 0.04);
      const tlMat = this.getTaillightMaterial();
      const tlL = new THREE.Mesh(tlGeo, tlMat);
      tlL.position.set(-W * 0.38, H * 0.4, -L * 0.505);
      const tlR = tlL.clone();
      tlR.position.x = W * 0.38;
      root.add(tlL, tlR);
      taillights.push(tlL, tlR);

      // Damas Wheels (Smaller)
      const wr = 0.28;
      const wPos = [
        [-W * 0.48, wr, L * 0.32],
        [W * 0.48, wr, L * 0.32],
        [-W * 0.48, wr, -L * 0.32],
        [W * 0.48, wr, -L * 0.32]
      ];
      wPos.forEach((pos, idx) => {
        const wheel = this.createWheel(wr, 0.2);
        wheel.position.set(...pos);
        root.add(wheel);
        wheels.push(wheel);
      });

    } else {
      // SEDAN & HATCHBACKS (Gentra, Cobalt, Nexia 3, Malibu 2, Spark)
      const isMalibu = carConfig.id === 'malibu2';
      const isGentra = carConfig.id === 'gentra';
      const isSpark = carConfig.id === 'spark';

      // Lower Chassis & Body Base
      const bodyBaseGeo = new THREE.BoxGeometry(W, H * 0.45, L);
      const bodyBase = new THREE.Mesh(bodyBaseGeo, bodyMat);
      bodyBase.position.y = H * 0.36;
      bodyBase.castShadow = true;
      root.add(bodyBase);

      // Cabin / Roof
      const cabinL = isSpark ? L * 0.6 : (isMalibu ? L * 0.55 : L * 0.5);
      const cabinW = W * 0.88;
      const cabinH = H * 0.48;
      const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
      const cabin = new THREE.Mesh(cabinGeo, bodyMat);
      const cabinZ = isSpark ? -L * 0.08 : (isMalibu ? -L * 0.04 : -L * 0.02);
      cabin.position.set(0, H * 0.72, cabinZ);
      cabin.castShadow = true;
      root.add(cabin);

      // Windshield (Front Slanted Glass)
      const windGeo = new THREE.PlaneGeometry(cabinW * 0.95, cabinH * 1.05);
      const windMat = this.getGlassMaterial(false);
      const windshield = new THREE.Mesh(windGeo, windMat);
      windshield.rotation.x = -Math.PI / 4.2;
      windshield.position.set(0, H * 0.72, cabinZ + cabinL * 0.52);
      root.add(windshield);

      // Rear Windshield
      const isGentraTinted = isGentra || isMalibu;
      const rearWindMat = this.getGlassMaterial(isGentraTinted);
      const rearWind = new THREE.Mesh(windGeo, rearWindMat);
      rearWind.rotation.x = Math.PI / 4.2;
      rearWind.rotation.y = Math.PI;
      rearWind.position.set(0, H * 0.72, cabinZ - cabinL * 0.52);
      root.add(rearWind);

      // Side Windows
      const sideWinGeo = new THREE.PlaneGeometry(cabinL * 0.82, cabinH * 0.75);
      const sideWinMat = this.getGlassMaterial(isGentraTinted);

      const sideWinL = new THREE.Mesh(sideWinGeo, sideWinMat);
      sideWinL.rotation.y = -Math.PI / 2;
      sideWinL.position.set(-cabinW * 0.505, H * 0.72, cabinZ);
      root.add(sideWinL);

      const sideWinR = new THREE.Mesh(sideWinGeo, sideWinMat);
      sideWinR.rotation.y = Math.PI / 2;
      sideWinR.position.set(cabinW * 0.505, H * 0.72, cabinZ);
      root.add(sideWinR);

      // Front Hood & Grille
      const hoodGeo = new THREE.BoxGeometry(W * 0.92, 0.08, L * 0.25);
      const hood = new THREE.Mesh(hoodGeo, bodyMat);
      hood.position.set(0, H * 0.52, L * 0.32);
      root.add(hood);

      // Front Grille
      const grilleGeo = new THREE.BoxGeometry(W * 0.55, 0.16, 0.05);
      const grilleColor = isGentra ? 0xcccccc : (isMalibu ? 0x111111 : 0x222222);
      const grilleMat = new THREE.MeshStandardMaterial({ color: grilleColor, metalness: isGentra ? 0.9 : 0.3, roughness: 0.3 });
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.set(0, H * 0.35, L * 0.505);
      root.add(grille);

      // Headlights
      const hlGeo = new THREE.BoxGeometry(W * 0.18, 0.14, 0.08);
      const hlMat = this.getHeadlightMaterial();
      const hlL = new THREE.Mesh(hlGeo, hlMat);
      hlL.position.set(-W * 0.35, H * 0.42, L * 0.5);
      const hlR = hlL.clone();
      hlR.position.x = W * 0.35;
      root.add(hlL, hlR);

      // Taillights
      const tlGeo = new THREE.BoxGeometry(W * 0.2, 0.14, 0.06);
      const tlMat = this.getTaillightMaterial();
      const tlL = new THREE.Mesh(tlGeo, tlMat);
      tlL.position.set(-W * 0.36, H * 0.42, -L * 0.505);
      const tlR = tlL.clone();
      tlR.position.x = W * 0.36;
      root.add(tlL, tlR);
      taillights.push(tlL, tlR);

      // Extra special detail: Gentra Spoiler or Malibu Diffuser
      if (isGentra) {
        const spoilerGeo = new THREE.BoxGeometry(W * 0.8, 0.05, 0.22);
        const spoilerMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.6 });
        const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
        spoiler.position.set(0, H * 0.64, -L * 0.46);
        root.add(spoiler);
      } else if (isMalibu) {
        // Dual Exhausts
        const exGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12);
        exGeo.rotateX(Math.PI / 2);
        const exMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95 });
        const exL = new THREE.Mesh(exGeo, exMat);
        exL.position.set(-W * 0.3, 0.2, -L * 0.51);
        const exR = exL.clone();
        exR.position.x = W * 0.3;
        root.add(exL, exR);
      }

      // Wheels
      const wr = isMalibu ? 0.38 : (isSpark ? 0.30 : 0.34);
      const wheelSpanZ = L * 0.31;
      const wheelSpanX = W * 0.48;

      const wPos = [
        [-wheelSpanX, wr, wheelSpanZ],
        [wheelSpanX, wr, wheelSpanZ],
        [-wheelSpanX, wr, -wheelSpanZ],
        [wheelSpanX, wr, -wheelSpanZ]
      ];
      wPos.forEach((pos) => {
        const wheel = this.createWheel(wr, 0.24);
        wheel.position.set(...pos);
        root.add(wheel);
        wheels.push(wheel);
      });
    }

    // License Plates (Front & Rear)
    const plateText = carConfig.plate || '01 | 777 BMM';
    const plateF = this.createLicensePlate(plateText);
    plateF.position.set(0, 0.28, L * 0.512);
    root.add(plateF);

    const plateR = this.createLicensePlate(plateText);
    plateR.rotation.y = Math.PI;
    plateR.position.set(0, 0.32, -L * 0.512);
    root.add(plateR);

    // Headlight Spotlights for Night/Evening Atmosphere
    const spotL = new THREE.SpotLight(0xfff8e7, 1.2, 35, Math.PI / 5, 0.4, 1.5);
    spotL.position.set(-W * 0.3, 0.6, L * 0.5);
    const targetL = new THREE.Object3D();
    targetL.position.set(-W * 0.3, 0.2, L * 0.5 + 15);
    root.add(targetL);
    spotL.target = targetL;
    root.add(spotL);

    const spotR = new THREE.SpotLight(0xfff8e7, 1.2, 35, Math.PI / 5, 0.4, 1.5);
    spotR.position.set(W * 0.3, 0.6, L * 0.5);
    const targetR = new THREE.Object3D();
    targetR.position.set(W * 0.3, 0.2, L * 0.5 + 15);
    root.add(targetR);
    spotR.target = targetR;
    root.add(spotR);

    // Save references for animations (wheels rotating, turning, brake lights)
    root.userData = {
      config: carConfig,
      bodyMat: bodyMat,
      taillights: taillights,
      frontWheels: [wheels[0], wheels[1]],
      rearWheels: [wheels[2], wheels[3]],
      allWheels: wheels,
      colorHex: colorHex
    };

    return root;
  }

  static setTaillightsBraking(carGroup, isBraking) {
    if (!carGroup || !carGroup.userData.taillights) return;
    const intensity = isBraking ? 1.6 : 0.3;
    carGroup.userData.taillights.forEach(tl => {
      if (tl.material) tl.material.emissiveIntensity = intensity;
    });
  }

  static updateWheelRotation(carGroup, distanceMoved, steerAngle) {
    if (!carGroup || !carGroup.userData.allWheels) return;
    const wr = carGroup.userData.config.dimensions.length * 0.08;
    const rollAngle = distanceMoved / wr;

    // Rotate all wheels rolling forward/backward
    carGroup.userData.allWheels.forEach(w => {
      w.children[0].rotation.x += rollAngle;
    });

    // Steer front wheels
    if (carGroup.userData.frontWheels) {
      carGroup.userData.frontWheels.forEach(fw => {
        fw.rotation.y = steerAngle;
      });
    }
  }

  static setCarColor(carGroup, newColorHex) {
    if (carGroup && carGroup.userData.bodyMat) {
      carGroup.userData.bodyMat.color.setHex(newColorHex);
      carGroup.userData.colorHex = newColorHex;
    }
  }
}

window.UZ_CARS = UZ_CARS;
window.CarModelFactory = CarModelFactory;
