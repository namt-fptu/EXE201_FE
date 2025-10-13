import { ReactNode } from "react";

interface ShowcaseSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ShowcaseSection({ title, children, className }: ShowcaseSectionProps) {
  return (
    <div className={`rounded-[10px] bg-white shadow-1 ${className || ''}`}>
      <h2 className="border-b border-stroke px-4 py-4 font-medium text-dark sm:px-6 xl:px-7.5">
        {title}
      </h2>
      
      <div className="p-4 sm:p-6 xl:p-7.5">
        {children}
      </div>
    </div>
  );
}
