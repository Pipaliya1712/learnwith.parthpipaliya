import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

type EmptyStateSuggestion = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  suggestions,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  suggestions?: EmptyStateSuggestion[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-10 py-8 text-center", className)}>
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Icon className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
          {description}
        </p>
        {action && (
          <Button
            className="mt-6 gap-2"
            onClick={action.onClick}
          >
            {action.icon && <action.icon className="size-4" />}
            {action.label}
          </Button>
        )}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mx-auto max-w-5xl rounded-xl border bg-card/35 p-6 text-left shadow-sm">
          <h3 className="mb-5 text-sm font-semibold">Try these suggestions</h3>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {suggestions.map((item, index) => {
              const SuggestionIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`space-y-4 xl:px-6 ${
                    index > 0 ? "xl:border-l" : ""
                  }`}
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground shadow-sm">
                    <SuggestionIcon className="size-5" />
                  </span>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateSuggestion };
