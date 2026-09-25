import Image from "next/image";

// Layer geometry is % of the product box (435 x 651 in the 1920 x 1080 Figma frame) so the
// composition scales uniformly. Photos are tilted 15deg as in the design; the wrapper is
// counter-rotated by the scroll timeline when the can needs to stand upright.
export default function Product({ className = "", ...rest }: { className?: string } & Record<`data-${string}`, string>) {
  return (
    <div className={`relative aspect-[435/651] ${className}`} data-product {...rest}>
      <div className="absolute top-[-40.75%] left-[-53.9%] h-[179.2%] w-[205.2%]" data-product-cast-shadow>
        <Image src="/product/can-shadow.svg" alt="" fill sizes="50vw" className="object-fill" unoptimized />
      </div>

      <div className="absolute top-[85.16%] left-[-17.58%] h-[29.65%] w-[97.91%]" data-product-shadow>
        <Image src="/product/shadow.png" alt="" fill sizes="30vw" className="object-fill" />
      </div>

      {/* Cryocap cap with its probe stem (stem sits inside the can). Placed so the lid lands
          on the Figma "Cap 1 1" position — seated on the collar, not floating above the neck. */}
      <div className="absolute top-[3.33%] left-[24.82%] h-[84.41%] w-[54.92%] rotate-[15deg]" data-product-cap>
        <Image src="/product/cap-probe.png" alt="" fill sizes="(min-width: 768px) 13vw, 40vw" className="object-fill" />
      </div>

      {/* Generic cap with foam stem; parked above the can until the Problems sequence.
          Sized/placed off Figma frame 6 (where it sits on the can), so it seats on the same
          neck as the Cryocap cap instead of hovering over the threads. */}
      <div className="absolute top-[4.51%] left-[30.58%] h-[54.41%] w-[54.44%] rotate-[15deg] opacity-0" data-product-generic-foam>
        <Image src="/product/generic-cap-foam.png" alt="" fill sizes="(min-width: 768px) 12vw, 36vw" className="object-fill" />
      </div>

      <div className="absolute top-[5.56%] left-[16.3%] h-[90.11%] w-[67.4%] rotate-[15deg]" data-product-can>
        <Image
          src="/product/can-body.png"
          alt="Cryocap smart cap fitted on a cryogenic can"
          fill
          priority
          sizes="(min-width: 768px) 16vw, 50vw"
          className="object-fill"
        />
      </div>

      {/* same can without the ATSUYA collar branding; shown while the Cryocap cap is off */}
      <div className="absolute top-[5.56%] left-[16.3%] h-[90.11%] w-[67.4%] rotate-[15deg] opacity-0" data-product-can-plain>
        <Image src="/product/can-body-plain.png" alt="" fill sizes="(min-width: 768px) 16vw, 50vw" className="object-fill" />
      </div>

      {/* Contact shadow the generic cap casts on the can's shoulder. Sits above the can but
          below the caps, and only shows once the cap is seated. Figma frame 6; the 15deg tilt
          is drawn into the artwork, so unlike the other layers this one is not rotated. */}
      <div className="absolute top-[10.35%] left-[42.4%] h-[8.6%] w-[43.98%] opacity-0" data-product-generic-shadow>
        <Image src="/product/generic-cap-shadow.svg" alt="" fill sizes="(min-width: 768px) 10vw, 30vw" className="object-fill" unoptimized />
      </div>

      <div className="absolute top-[4.61%] left-[39.01%] h-[10.84%] w-[54.92%] rotate-[15deg]" data-product-cap-top>
        <Image src="/product/cap-top.png" alt="" fill sizes="(min-width: 768px) 13vw, 40vw" className="object-fill" />
      </div>

      <div className="absolute top-[5.26%] left-[39.10%] h-[10.08%] w-[54.44%] rotate-[15deg] opacity-0" data-product-generic-top>
        <Image src="/product/generic-cap-top.png" alt="" fill sizes="(min-width: 768px) 12vw, 36vw" className="object-fill" />
      </div>
    </div>
  );
}
