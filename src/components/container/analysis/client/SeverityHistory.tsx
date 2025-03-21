import React from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { symbols } from "@/schema";
import { useGetClienttRouteComponentCommentQuery } from "@/store/api";
// import { useRouter } from "next/router";

interface SeverityHistoryProps {
  // isLoading: boolean;
  selectedComponent: {
    routeComponent?: {
      id: string;
    }[];
  } | null;
}

const SeverityHistory: React.FC<SeverityHistoryProps> = ({
  // isLoading,
  selectedComponent,
}) => {
  const routeComponentIds = React.useMemo(
    () => selectedComponent?.routeComponent?.map((rc) => rc.id) ?? [],
    [selectedComponent]
  );

  const {
    data: routeComponents,
    isFetching: queryLoading,
    refetch,
  } = useGetClienttRouteComponentCommentQuery(routeComponentIds, {
    skip: !routeComponentIds || routeComponentIds.length === 0,
  }) ?? { routeComponentComments: [] };

  const showLoading = queryLoading;

  const hasRefetched = React.useRef(false);

  React.useEffect(() => {
    if (
      routeComponentIds &&
      routeComponentIds.length > 0 &&
      !hasRefetched.current
    ) {
      refetch().then(() => {
        hasRefetched.current = true;
      });
    }
  }, [routeComponentIds, refetch]);

  React.useEffect(() => {
    hasRefetched.current = false;
  }, [routeComponentIds]);

  const severityMap: Record<string, string> = Object.fromEntries(
    symbols.map((s) => [s.label, `${s.image}.png`])
  );

  const comments =
    routeComponentIds.length === 0
      ? [] // Reset if no routeComponentIds
      : routeComponents?.routeComponentComments.flatMap((rc) => rc.comments) ||
        [];

  console.log("severityhistory: ", comments);

  return (
    <div>
      <div className="flex gap-3 flex-wrap mt-3">
        {symbols.map((symbol) => (
          <div key={symbol.image} className="flex gap-1">
            <Image
              src={`/severity/${symbol.image}.png`}
              width={40}
              height={40}
              alt="Symbol"
              className="w-5 object-cover"
            />
            <h1 className="text-sm text-zinc-600">{symbol.label}</h1>
          </div>
        ))}
      </div>
      <div className="border rounded-lg flex overflow-auto mt-3">
        {Array.from({ length: 10 }).map((_, index) => {
          const comment = comments[index] || null;

          return (
            <div key={index} className="flex flex-col border-r w-full">
              <h1 className="text-sm font-semibold text-zinc-800 px-3 py-1 text-center border-b">
                {index === 0 ? "Current" : "Previous"}
              </h1>
              <div className="flex justify-center items-center py-1">
                {showLoading ? (
                  <Skeleton className="w-5 h-5 animate-pulse bg-zinc-200" />
                ) : comment ? (
                  <Image
                    src={`/severity/${severityMap[String(comment.severity)]}`}
                    width={30}
                    height={30}
                    alt="Severity Symbol"
                    className="w-5 object-cover"
                  />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeverityHistory;
