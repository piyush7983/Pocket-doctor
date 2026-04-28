interface Props {
  type?: "page" | "card" | "chat" | "sidebar";
  count?: number;
}

export default function LoadingSkeleton({ type = "card", count = 3 }: Props) {
  if (type === "page") {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-4 w-96 rounded-lg" />
        <div className="space-y-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "chat") {
    return (
      <div className="space-y-6 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`skeleton rounded-2xl ${
                i % 2 === 0
                  ? "h-16 w-3/4 rounded-br-md"
                  : "h-24 w-4/5 rounded-bl-md"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "sidebar") {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  // Card type
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-2xl" />
      ))}
    </div>
  );
}
