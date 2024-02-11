// https://www.youtube.com/watch?v=KPoeNZZ6H4s&ab_channel=t3ssel8r
// https://en.wikipedia.org/wiki/Semi-implicit_Euler_method

export class SecondOrderDynamics {
  private y: number; // position (output)
  private xp: number; // previous input
  private yd: number; // velocity

  private k1: number; // dynamics constant
  private k2: number; // dynamics constant
  private k3: number; // dynamics constant

  /**
   * @param f natural frequency measured in Hz, or cycles per
   * second. It describes the speed at which the system will
   * respond to changes in the input, as well as the frequency
   * the system will tend to vibrate at, but does not affect
   * the shape of the motion.
   *
   * @param z damping ratio. It describes how the system comes
   * to settle at the target.
   *
   * - z=0 - undamped state where vibration never stops
   * - z<1 - underdamped
   * - z=1 - critical damping
   * - z>1 - overdamped state where the system will not vibrate
   *
   * @param r controls the initial response of the system.
   *
   * - r<0 - the system will anticipate the motion
   * - r=0 - the system takes time to begin accelerating from the rest
   * - r>0 - the system reacts immediately
   * - r>1 - the system will overshoot the target
   *
   * @param x0 the initial input
   */
  constructor(f: number, z: number, r: number, x0: number) {
    // compute constants
    this.k1 = z / (Math.PI * f);
    this.k2 = 1 / (2 * Math.PI * f * (2 * Math.PI * f));
    this.k3 = (r * z) / (2 * Math.PI * f);

    // initialize variables
    this.xp = x0;
    this.y = x0;
    this.yd = 0;
  }

  public update(T: number, x: number, xd?: number): number {
    if (xd === undefined) {
      // estimate velocity
      xd = (x - this.xp) / T;
      this.xp = x;
    }

    // clamp k2 to guarantee stability
    const k2_stable = Math.max(
      this.k2,
      1.1 * ((T * T) / 4 + (T * this.k1) / 2)
    );

    // integrate position by velocity
    this.y += T * this.yd;

    // integrate velocity by acceleration
    this.yd +=
      (T * (x + this.k3 * xd - this.y - this.k1 * this.yd)) / k2_stable;

    return this.y;
  }
}
