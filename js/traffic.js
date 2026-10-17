// Autonomous City Traffic AI for Parking BMM_UZ
class TrafficManager {
  constructor(scene, trafficData) {
    this.scene = scene;
    this.trafficData = trafficData; // { avenues, bounds, laneOffset }
    this.cars = [];
    this.maxCars = 14;
  }

  init() {
    const carPool = ['gentra', 'cobalt', 'nexia3', 'damas', 'spark'];
    const colors = [0xffffff, 0x111111, 0xbdc3c7, 0x34495e, 0xad1457, 0x00cec9, 0xf5f6fa];

    const avenues = this.trafficData.avenues;
    if (!avenues || avenues.length === 0) return;

    for (let i = 0; i < this.maxCars; i++) {
      const modelId = carPool[i % carPool.length];
      const carConfig = UZ_CARS.find(c => c.id === modelId);
      const color = colors[i % colors.length];

      const mesh = CarModelFactory.createCar(carConfig, color);

      // Random starting road & direction (EW or NS)
      const isEW = Math.random() > 0.5;
      const roadCoord = avenues[Math.floor(Math.random() * avenues.length)];
      const progress = -120 + Math.random() * 240;
      const dirSign = Math.random() > 0.5 ? 1 : -1;

      let posX, posZ, rotY;
      const laneOffset = this.trafficData.laneOffset * (dirSign > 0 ? 1 : -1);

      if (isEW) {
        posX = progress;
        posZ = roadCoord + laneOffset;
        rotY = dirSign > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        posX = roadCoord - laneOffset;
        posZ = progress;
        rotY = dirSign > 0 ? 0 : Math.PI;
      }

      mesh.position.set(posX, 0, posZ);
      mesh.rotation.y = rotY;

      this.scene.add(mesh);

      this.cars.push({
        mesh: mesh,
        config: carConfig,
        speed: 8 + Math.random() * 6, // 30-50 km/h in m/s
        targetSpeed: 10 + Math.random() * 5,
        currentSpeed: 10,
        isEW: isEW,
        roadCoord: roadCoord,
        dirSign: dirSign,
        length: carConfig.dimensions.length,
        width: carConfig.dimensions.width,
        isBraking: false
      });
    }
  }

  update(dt, playerCar) {
    const bounds = this.trafficData.bounds;
    const avenues = this.trafficData.avenues;
    const laneDist = this.trafficData.laneOffset;

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      let shouldBrake = false;

      // 1. Proximity check with Player Car
      if (playerCar) {
        const dx = playerCar.position.x - car.mesh.position.x;
        const dz = playerCar.position.z - car.mesh.position.z;
        const distToPlayer = Math.sqrt(dx * dx + dz * dz);

        if (distToPlayer < 9) {
          // Check if player is directly ahead of traffic car
          const forwardVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.mesh.rotation.y);
          const toPlayerVec = new THREE.Vector3(dx, 0, dz).normalize();
          const dot = forwardVec.dot(toPlayerVec);

          if (dot > 0.65) {
            shouldBrake = true;
          }
        }
      }

      // 2. Proximity check with other traffic cars ahead
      for (let j = 0; j < this.cars.length; j++) {
        if (i === j) continue;
        const other = this.cars[j];
        const dx = other.mesh.position.x - car.mesh.position.x;
        const dz = other.mesh.position.z - car.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 8) {
          const forwardVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.mesh.rotation.y);
          const toOtherVec = new THREE.Vector3(dx, 0, dz).normalize();
          const dot = forwardVec.dot(toOtherVec);
          if (dot > 0.7) {
            shouldBrake = true;
            break;
          }
        }
      }

      // Smooth acceleration / braking
      if (shouldBrake) {
        car.currentSpeed = Math.max(0, car.currentSpeed - 18 * dt);
        car.isBraking = true;
      } else {
        car.currentSpeed = Math.min(car.targetSpeed, car.currentSpeed + 10 * dt);
        car.isBraking = false;
      }

      CarModelFactory.setTaillightsBraking(car.mesh, car.isBraking);

      // Move along forward vector
      const moveDist = car.currentSpeed * dt;
      const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.mesh.rotation.y);
      car.mesh.position.addScaledVector(fwd, moveDist);

      // Rotate wheels
      CarModelFactory.updateWheelRotation(car.mesh, moveDist, 0);

      // Check boundary turnarounds or intersections
      const pos = car.mesh.position;
      if (car.isEW) {
        if (pos.x > bounds.max) {
          // Loop around or switch lane
          pos.x = bounds.min;
        } else if (pos.x < bounds.min) {
          pos.x = bounds.max;
        }
      } else {
        if (pos.z > bounds.max) {
          pos.z = bounds.min;
        } else if (pos.z < bounds.min) {
          pos.z = bounds.max;
        }
      }
    }
  }

  getTrafficPositions() {
    return this.cars.map(c => ({
      x: c.mesh.position.x,
      z: c.mesh.position.z,
      rot: c.mesh.rotation.y
    }));
  }
}

window.TrafficManager = TrafficManager;
