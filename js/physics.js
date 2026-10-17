// Vehicle Physics and Dynamics Engine for Parking BMM_UZ
class VehiclePhysics {
  constructor(carConfig, colliders) {
    this.config = carConfig;
    this.colliders = colliders || [];

    // State
    this.speed = 0; // current speed in m/s (forward > 0, reverse < 0)
    this.steeringAngle = 0; // radians
    this.gear = 'D'; // 'D', 'R', 'N', 'P'
    this.isBraking = false;
    this.isHandbrake = false;

    // Tuning from config
    this.maxSpeed = (this.config.specs.maxSpeed * 1000) / 3600; // converted to m/s (~35-45 m/s)
    this.maxReverseSpeed = 8.5; // ~30 km/h
    this.accelRate = this.config.specs.acceleration * 0.45;
    this.brakeRate = this.config.specs.brakePower * 0.85;
    this.turnRate = this.config.specs.turnSpeed;
    this.friction = 3.2; // road drag
    this.maxSteerAngle = 0.58; // ~33 degrees max wheel turn

    this.carMesh = null;
  }

  setCarMesh(mesh, carConfig) {
    this.carMesh = mesh;
    this.config = carConfig;
    this.maxSpeed = (this.config.specs.maxSpeed * 1000) / 3600;
    this.accelRate = this.config.specs.acceleration * 0.45;
    this.brakeRate = this.config.specs.brakePower * 0.85;
    this.turnRate = this.config.specs.turnSpeed;
    this.speed = 0;
    this.steeringAngle = 0;
  }

  update(dt, input) {
    if (!this.carMesh) return;

    // Steering input
    let targetSteer = 0;
    if (input.left) targetSteer += this.maxSteerAngle;
    if (input.right) targetSteer -= this.maxSteerAngle;

    // Smooth steering transition
    const steerSpeed = 6.0;
    this.steeringAngle += (targetSteer - this.steeringAngle) * steerSpeed * dt;

    this.isBraking = false;
    this.isHandbrake = !!input.handbrake;

    // Throttle & Brake logic
    if (input.forward) {
      if (this.speed < -0.2) {
        // Was reversing -> press forward acts as brake first
        this.speed += this.brakeRate * 1.5 * dt;
        this.isBraking = true;
      } else {
        // Accelerate forward
        this.gear = 'D';
        this.speed += this.accelRate * dt;
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
      }
    } else if (input.backward) {
      if (this.speed > 0.2) {
        // Was moving forward -> press backward acts as brake
        this.speed -= this.brakeRate * 1.5 * dt;
        this.isBraking = true;
      } else {
        // Reverse
        this.gear = 'R';
        this.speed -= (this.accelRate * 0.6) * dt;
        if (this.speed < -this.maxReverseSpeed) this.speed = -this.maxReverseSpeed;
      }
    } else {
      // Natural rolling friction deceleration
      if (Math.abs(this.speed) < 0.2) {
        this.speed = 0;
      } else if (this.speed > 0) {
        this.speed -= this.friction * dt;
      } else {
        this.speed += this.friction * dt;
      }
    }

    // Handbrake
    if (this.isHandbrake) {
      this.isBraking = true;
      const handbrakeBite = 28.0 * dt;
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - handbrakeBite);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + handbrakeBite);
      }
    }

    // Bicycle Model Turn dynamics
    if (Math.abs(this.speed) > 0.05) {
      // Speed factor makes high-speed steering stable and low-speed parking agile
      const speedRatio = Math.min(Math.abs(this.speed) / 12, 1.0);
      const effectiveTurn = this.steeringAngle * (1.2 - speedRatio * 0.5) * this.turnRate;
      const turnAmount = effectiveTurn * (this.speed > 0 ? 1 : -1) * dt;
      this.carMesh.rotation.y += turnAmount;
    }

    // Displacement
    const moveDist = this.speed * dt;
    const fwdVector = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carMesh.rotation.y);
    
    // Tentative new position
    const nextX = this.carMesh.position.x + fwdVector.x * moveDist;
    const nextZ = this.carMesh.position.z + fwdVector.z * moveDist;

    // Collision Check
    const colResult = this.checkCollisions(nextX, nextZ);
    if (!colResult.collided) {
      this.carMesh.position.x = nextX;
      this.carMesh.position.z = nextZ;
    } else {
      // Bounce back slightly and absorb speed on crash
      this.speed = -this.speed * 0.3;
      if (window.soundEngine) window.soundEngine.playClick();
    }

    // Update visuals: Wheels rotation, steering and brake lights
    CarModelFactory.updateWheelRotation(this.carMesh, moveDist, this.steeringAngle);
    CarModelFactory.setTaillightsBraking(this.carMesh, this.isBraking || this.gear === 'R');
  }

  checkCollisions(x, z) {
    const halfLen = this.config.dimensions.length * 0.45;
    const halfWid = this.config.dimensions.width * 0.45;

    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      if (col.type === 'box') {
        if (
          x + halfWid > col.minX &&
          x - halfWid < col.maxX &&
          z + halfLen > col.minZ &&
          z - halfLen < col.maxZ
        ) {
          return { collided: true, collider: col };
        }
      } else if (col.type === 'circle') {
        const dx = x - col.x;
        const dz = z - col.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < col.radius + halfWid) {
          return { collided: true, collider: col };
        }
      }
    }
    return { collided: false };
  }

  getSpeedKmh() {
    return Math.round(this.speed * 3.6);
  }

  resetPosition(x = 0, z = 0, rotY = 0) {
    this.speed = 0;
    this.steeringAngle = 0;
    if (this.carMesh) {
      this.carMesh.position.set(x, 0, z);
      this.carMesh.rotation.set(0, rotY, 0);
    }
  }
}

window.VehiclePhysics = VehiclePhysics;
