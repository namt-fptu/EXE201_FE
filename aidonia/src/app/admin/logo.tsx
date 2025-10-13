import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src="/images/logo/logo-icon.svg"
        width={32}
        height={32}
        alt="Aidonia logo"
        role="presentation"
        quality={100}
      />
      <span className="text-xl font-bold text-primary-700">
        Aidonia
      </span>
    </div>
  );
}
