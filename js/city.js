// City Environment Generator for Parking BMM_UZ
class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.parkingSpots = [];
    this.trafficWaypoints = [];
    this.roadSegments = [];
    this.citySize = 360; // Total city dimension in meters
    this.blockSize = 60; // Size of each city block
    this.roadWidth = 16; // Width of multi-lane roads
  }

  build() {
    this.createGround();
    this.createRoadNetwork();
    this.createBuildings();
    this.createGasStation();
    this.createParkingLots();
    this.createStreetProps();
    this.generateTrafficWaypoints();
    return {
      colliders: this.colliders,
      parkingSpots: this.parkingSpots,
      trafficWaypoints: this.trafficWaypoints
    };
  }

  createGround() {
    // Large base ground
    const groundGeo = new THREE.PlaneGeometry(this.citySize * 1.5, this.citySize * 1.5);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a221b, // Dark green grass/soil
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.85 });
    const lineWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineYellowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

    this.avenues = [-152, -76, 0, 76, 152];

    // Roads along X and Z
    this.avenues.forEach(pos => {
      // East-West Road
      const roadEWGeo = new THREE.PlaneGeometry(this.citySize, this.roadWidth);
      const roadEW = new THREE.Mesh(roadEWGeo, roadMat);
      roadEW.rotation.x = -Math.PI / 2;
      roadEW.position.set(0, 0.02, pos);
      roadEW.receiveShadow = true;
      this.scene.add(roadEW);

      // North-South Road
      const roadNSGeo = new THREE.PlaneGeometry(this.roadWidth, this.citySize);
      const roadNS = new THREE.Mesh(roadNSGeo, roadMat);
      roadNS.rotation.x = -Math.PI / 2;
      roadNS.position.set(pos, 0.02, 0);
      roadNS.receiveShadow = true;
      this.scene.add(roadNS);

      // Yellow double-centerline for EW
      const lineEW = new THREE.Mesh(new THREE.PlaneGeometry(this.citySize, 0.25), lineYellowMat);
      lineEW.rotation.x = -Math.PI / 2;
      lineEW.position.set(0, 0.04, pos);
      this.scene.add(lineEW);

      // Yellow double-centerline for NS
      const lineNS = new THREE.Mesh(new THREE.PlaneGeometry(0.25, this.citySize), lineYellowMat);
      lineNS.rotation.x = -Math.PI / 2;
      lineNS.position.set(pos, 0.04, 0);
      this.scene.add(lineNS);

      // Dashed lane lines
      const halfSize = this.citySize / 2;
      for (let offset = -halfSize; offset <= halfSize; offset += 8) {
        // EW white dashes (+3.8m and -3.8m)
        const dash1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.2), lineWhiteMat);
        dash1.rotation.x = -Math.PI / 2;
        dash1.position.set(offset, 0.04, pos + 3.8);
        const dash2 = dash1.clone();
        dash2.position.z = pos - 3.8;
        this.scene.add(dash1, dash2);

        // NS white dashes (+3.8m and -3.8m)
        const dash3 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 4), lineWhiteMat);
        dash3.rotation.x = -Math.PI / 2;
        dash3.position.set(pos + 3.8, 0.04, offset);
        const dash4 = dash3.clone();
        dash4.position.x = pos - 3.8;
        this.scene.add(dash3, dash4);
      }
    });
  }

  createBuildings() {
    this.blockCenters = [-114, -38, 38, 114];
    const blockInner = 54; // inner building footprint

    let blockIndex = 0;
    for (let i = 0; i < this.blockCenters.length; i++) {
      for (let j = 0; j < this.blockCenters.length; j++) {
        const x = this.blockCenters[i];
        const z = this.blockCenters[j];
        blockIndex++;

        // Block at (-38, 38) reserved for Gas Station (Benzokalonka)
        if (x === -38 && z === 38) {
          this.createGasStation(x, z);
          continue;
        }

        // Block at (38, 38) reserved for Grand Shopping Mall & Big Parking Plaza
        if (x === 38 && z === 38) {
          this.createMallBlock(x, z, blockInner);
          continue;
        }

        this.createCityBlock(x, z, blockInner);
      }
    }
  }

  createCityBlock(bx, bz, size) {
    // Sidewalk base for this block
    const swGeo = new THREE.BoxGeometry(size + 3, 0.25, size + 3);
    const swMat = new THREE.MeshStandardMaterial({ color: 0x8a9597, roughness: 0.9 });
    const sw = new THREE.Mesh(swGeo, swMat);
    sw.position.set(bx, 0.12, bz);
    sw.receiveShadow = true;
    this.scene.add(sw);

    // Subdivide block into 2-4 buildings or a park
    const subDivide = Math.random() > 0.3 ? 2 : 1;
    const bColors = [0x2c3e50, 0x34495e, 0x485460, 0x1e272e, 0xd2dae2];

    if (subDivide === 1) {
      // Single Large Skyscraper
      const height = 30 + Math.random() * 45;
      const bGeo = new THREE.BoxGeometry(size * 0.75, height, size * 0.75);
      const bMat = new THREE.MeshStandardMaterial({
        color: bColors[Math.floor(Math.random() * bColors.length)],
        metalness: 0.5,
        roughness: 0.2
      });
      const bldg = new THREE.Mesh(bGeo, bMat);
      bldg.position.set(bx, height / 2 + 0.2, bz);
      bldg.castShadow = true;
      bldg.receiveShadow = true;
      this.scene.add(bldg);

      // Add windows texture/effect with glowing emissive planes
      this.addBuildingWindows(bldg, size * 0.75, height, size * 0.75);

      this.colliders.push({
        type: 'box',
        minX: bx - size * 0.38,
        maxX: bx + size * 0.38,
        minZ: bz - size * 0.38,
        maxZ: bz + size * 0.38
      });
    } else {
      // 2 to 4 diverse commercial/residential buildings
      const halfB = size / 2;
      const offsets = [
        [-halfB * 0.45, -halfB * 0.45],
        [halfB * 0.45, -halfB * 0.45],
        [-halfB * 0.45, halfB * 0.45],
        [halfB * 0.45, halfB * 0.45]
      ];

      offsets.forEach(([ox, oz]) => {
        const bw = size * 0.4;
        const bd = size * 0.4;
        const bh = 15 + Math.random() * 25;
        const bGeo = new THREE.BoxGeometry(bw, bh, bd);
        const bMat = new THREE.MeshStandardMaterial({
          color: bColors[Math.floor(Math.random() * bColors.length)],
          roughness: 0.4,
          metalness: 0.3
        });
        const b = new THREE.Mesh(bGeo, bMat);
        b.position.set(bx + ox, bh / 2 + 0.2, bz + oz);
        b.castShadow = true;
        b.receiveShadow = true;
        this.scene.add(b);

        this.addBuildingWindows(b, bw, bh, bd);

        this.colliders.push({
          type: 'box',
          minX: bx + ox - bw / 2,
          maxX: bx + ox + bw / 2,
          minZ: bz + oz - bd / 2,
          maxZ: bz + oz + bd / 2
        });
      });
    }

    // Add trees on sidewalks around this block
    const treeOffset = size / 2 + 0.8;
    for (let t = -size / 2 + 5; t <= size / 2 - 5; t += 15) {
      if (Math.random() > 0.3) this.createTree(bx + t, bz + treeOffset);
      if (Math.random() > 0.3) this.createTree(bx + t, bz - treeOffset);
    }
  }

  addBuildingWindows(bldgMesh, w, h, d) {
    // Add glowing window bands for architectural realism
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfffae0,
      emissive: 0xffec99,
      emissiveIntensity: 0.4
    });
    const floors = Math.floor(h / 3.5);
    for (let f = 1; f < floors; f += 2) {
      const bandGeo = new THREE.BoxGeometry(w + 0.05, 0.6, d + 0.05);
      const band = new THREE.Mesh(bandGeo, winMat);
      band.position.set(bldgMesh.position.x, f * 3.5 + 1.5, bldgMesh.position.z);
      this.scene.add(band);
    }
  }

  createMallBlock(bx, bz, size) {
    // Large "TOSHKENT CITY MALL / SAMARKAND DARVOZA" style complex
    const mallW = size * 0.85;
    const mallD = size * 0.45;
    const mallH = 16;

    const mallGeo = new THREE.BoxGeometry(mallW, mallH, mallD);
    const mallMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7, roughness: 0.2 });
    const mall = new THREE.Mesh(mallGeo, mallMat);
    mall.position.set(bx, mallH / 2 + 0.2, bz - size * 0.2);
    mall.castShadow = true;
    this.scene.add(mall);

    // Glass facade
    const glassGeo = new THREE.PlaneGeometry(mallW * 0.9, mallH * 0.6);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x0084ff,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.8
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(bx, mallH * 0.5, bz - size * 0.2 + mallD / 2 + 0.05);
    this.scene.add(glass);

    // Mall Sign "TOSHKENT GRAND MALL"
    this.createSignboard(bx, mallH + 1.2, bz - size * 0.2 + mallD / 2, "TOSHKENT MALL");

    this.colliders.push({
      type: 'box',
      minX: bx - mallW / 2,
      maxX: bx + mallW / 2,
      minZ: bz - size * 0.2 - mallD / 2,
      maxZ: bz - size * 0.2 + mallD / 2
    });

    // In front of mall: Dedicated Parking Bay Lot
    const lotZ = bz + size * 0.22;
    this.createMallParkingLot(bx, lotZ, size * 0.85, size * 0.4);
  }

  createMallParkingLot(cx, cz, width, depth) {
    // Asphalt lot
    const lotGeo = new THREE.PlaneGeometry(width, depth);
    const lotMat = new THREE.MeshStandardMaterial({ color: 0x272b30, roughness: 0.8 });
    const lot = new THREE.Mesh(lotGeo, lotMat);
    lot.rotation.x = -Math.PI / 2;
    lot.position.set(cx, 0.03, cz);
    lot.receiveShadow = true;
    this.scene.add(lot);

    // Add several marked parking spots
    const spotW = 2.8;
    const spotL = 5.2;
    const count = Math.floor(width / (spotW + 0.6));

    for (let i = 0; i < count; i++) {
      const sx = cx - width / 2 + 2.5 + i * (spotW + 0.5);
      const sz = cz;
      this.addParkingSpot(sx, sz, 0, `Savdo Markazi #${i + 1}`);
    }
  }

  createGasStation(gx = -38, gz = 38) {
    // Benzokalonka "UNG PETROL" (Uzbekneftgaz)
    const baseGeo = new THREE.BoxGeometry(50, 0.2, 50);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333b42 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(gx, 0.1, gz);
    this.scene.add(base);

    // Canopy Roof
    const canopyW = 28;
    const canopyD = 20;
    const canopyH = 6.5;

    const roofGeo = new THREE.BoxGeometry(canopyW, 0.8, canopyD);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.3 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(gx, canopyH, gz);
    roof.castShadow = true;
    this.scene.add(roof);

    // Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    const pCoords = [
      [-canopyW * 0.35, -canopyD * 0.3],
      [canopyW * 0.35, -canopyD * 0.3],
      [-canopyW * 0.35, canopyD * 0.3],
      [canopyW * 0.35, canopyD * 0.3]
    ];

    pCoords.forEach(([px, pz]) => {
      const pilGeo = new THREE.CylinderGeometry(0.35, 0.35, canopyH, 16);
      const pil = new THREE.Mesh(pilGeo, pillarMat);
      pil.position.set(gx + px, canopyH / 2, gz + pz);
      pil.castShadow = true;
      this.scene.add(pil);

      this.colliders.push({
        type: 'box',
        minX: gx + px - 0.5,
        maxX: gx + px + 0.5,
        minZ: gz + pz - 0.5,
        maxZ: gz + pz + 0.5
      });
    });

    // Fuel Pumps (Kolonkalar)
    for (let k = -1; k <= 1; k += 2) {
      const pumpGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
      const pumpMat = new THREE.MeshStandardMaterial({ color: 0xff3838 });
      const pump = new THREE.Mesh(pumpGeo, pumpMat);
      pump.position.set(gx, 0.9, gz + k * 4.5);
      pump.castShadow = true;
      this.scene.add(pump);

      this.colliders.push({
        type: 'box',
        minX: gx - 0.7,
        maxX: gx + 0.7,
        minZ: gz + k * 4.5 - 0.5,
        maxZ: gz + k * 4.5 + 0.5
      });
    }

    // Signboard "UNG PETROL"
    this.createSignboard(gx, canopyH + 1.2, gz + canopyD / 2, "UNG PETROL BMM");

    // Parking near gas station convenience store
    this.addParkingSpot(gx + 10, gz - 8, Math.PI / 2, "Benzokalonka Kafesi");
    this.addParkingSpot(gx + 10, gz - 14, Math.PI / 2, "Benzokalonka #2");
  }

  createSignboard(x, y, z, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0052cc';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const signGeo = new THREE.PlaneGeometry(8, 2);
    const signMat = new THREE.MeshBasicMaterial({ map: texture });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y, z);
    this.scene.add(sign);
  }

  createParkingLots() {
    let spotId = 1;
    // Add parking bays along avenue curbs
    this.avenues.forEach(av => {
      if (Math.abs(av) <= 76) {
        this.addParkingSpot(av - 6.2, 22, 0, `Markaziy Ko'cha #${spotId++}`);
        this.addParkingSpot(av + 6.2, -22, Math.PI, `Shahar Xiyoboni #${spotId++}`);
        this.addParkingSpot(22, av - 6.2, Math.PI / 2, `Biznes Markaz #${spotId++}`);
        this.addParkingSpot(-22, av + 6.2, -Math.PI / 2, `Turar-joy Majmuasi #${spotId++}`);
      }
    });
  }

  addParkingSpot(x, z, rotation, labelName) {
    const width = 2.6;
    const length = 5.4;

    const spotGroup = new THREE.Group();
    spotGroup.position.set(x, 0.05, z);
    spotGroup.rotation.y = rotation;

    // Glowing target boundary lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.85 });
    const lineThick = 0.14;

    // Left line
    const lLine = new THREE.Mesh(new THREE.PlaneGeometry(lineThick, length), lineMat);
    lLine.rotation.x = -Math.PI / 2;
    lLine.position.set(-width / 2, 0, 0);
    spotGroup.add(lLine);

    // Right line
    const rLine = new THREE.Mesh(new THREE.PlaneGeometry(lineThick, length), lineMat);
    rLine.rotation.x = -Math.PI / 2;
    rLine.position.set(width / 2, 0, 0);
    spotGroup.add(rLine);

    // Back line (stopper)
    const bLine = new THREE.Mesh(new THREE.PlaneGeometry(width, lineThick), lineMat);
    bLine.rotation.x = -Math.PI / 2;
    bLine.position.set(0, 0, -length / 2);
    spotGroup.add(bLine);

    // "P" parking symbol on ground
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#00e676';
    pCtx.font = 'bold 90px sans-serif';
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    pCtx.fillText('P', 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: pTex, transparent: true }));
    pMesh.rotation.x = -Math.PI / 2;
    pMesh.position.set(0, 0.01, 0);
    spotGroup.add(pMesh);

    // Overhead navigational beacon light cylinder
    const beaconGeo = new THREE.CylinderGeometry(1.2, 1.2, 18, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 9, 0);
    spotGroup.add(beacon);

    this.scene.add(spotGroup);

    this.parkingSpots.push({
      id: this.parkingSpots.length + 1,
      name: labelName,
      x: x,
      z: z,
      rotation: rotation,
      width: width,
      length: length,
      meshGroup: spotGroup,
      beacon: beacon
    });
  }

  createTree(x, z) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage (Plump green spheres or cones)
    const foliageGeo = new THREE.DodecahedronGeometry(1.8, 1);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 3.6;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    this.scene.add(treeGroup);

    this.colliders.push({
      type: 'circle',
      x: x,
      z: z,
      radius: 0.5
    });
  }

  createStreetProps() {
    // Street Lamps along roads
    for (let pos = -140; pos <= 140; pos += 35) {
      this.avenues.forEach(av => {
        this.createStreetLamp(av - 8.8, pos);
        this.createStreetLamp(pos, av + 8.8);
      });
    }
  }

  createStreetLamp(x, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 6.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.25;
    lamp.add(pole);

    // Arm
    const armGeo = new THREE.BoxGeometry(1.2, 0.1, 0.1);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0.5, 6.4, 0);
    lamp.add(arm);

    // Light bulb
    const bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(1.0, 6.3, 0);
    lamp.add(bulb);

    this.scene.add(lamp);

    this.colliders.push({
      type: 'circle',
      x: x,
      z: z,
      radius: 0.3
    });
  }

  generateTrafficWaypoints() {
    this.trafficWaypoints = {
      avenues: this.avenues,
      bounds: { min: -150, max: 150 },
      laneOffset: 3.8
    };
  }
}

window.CityBuilder = CityBuilder;
