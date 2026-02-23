import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Optional title with emoji icon */
  title?: string;
  /** Right-side header content (e.g., buttons, filters) */
  headerAction?: ReactNode;
  /** Remove default padding */
  noPadding?: boolean;
}

export function Card({ children, className = "", title, headerAction, noPadding }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          {title && <h3 className="text-base font-semibold text-gray-800">{title}</h3>}
          {headerAction}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

/** Animated skeleton placeholder for loading states */
export function CardSkeleton({ title, height = 300 }: { title?: string; height?: number }) {
  return (
    <div className="animate-fade-in rounded-xl border border-gray-100 bg-white shadow-card">
      {title && (
        <div className="border-b border-gray-50 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="w-full space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
