import { Search, X } from "lucide-react";

interface SidebarSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

export function SidebarSearch({
  searchQuery,
  onSearchChange,
  onClear,
}: SidebarSearchProps) {
  return (
    <div className="px-3 pt-3 pb-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-muted/60 hover:bg-muted focus:bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 p-0.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clear menu search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
