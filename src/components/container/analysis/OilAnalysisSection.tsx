import { Skeleton } from "@/components/ui/skeleton";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import OilAnalysis from "../dialogs/OilAnalysis";
import { useGetRouteComponenetOilAnalysisQuery } from "@/store/api";
import { symbols } from "@/schema";
import Image from "next/image";

// interface OilAnalyses {
//   analysis: string;
// }

interface SelectedComponent {
  id: string;
  routeComponentID: string;
  // name: string;
  // oilAnalyses: OilAnalyses[];
}

interface OilAnalysisSectionProps {
  isLoading: boolean;
  selectedComponent: SelectedComponent | null;
  openOilAnalysis: boolean;
  setOpenOilAnalysis: Dispatch<SetStateAction<boolean>>;
}

const OilAnalysisSection: React.FC<OilAnalysisSectionProps> = ({
  isLoading,
  selectedComponent,
  openOilAnalysis,
  setOpenOilAnalysis,
}) => {
  const routeComponentID = selectedComponent?.routeComponentID as string;

  const {
    data: routeComponentOilAnalysis,
    isLoading: queryLoading,
    error: routeComponentOilAnalysisError,
  } = useGetRouteComponenetOilAnalysisQuery(routeComponentID, {
    skip: !routeComponentID,
  });

  const showLoading = isLoading || queryLoading;

  if (routeComponentOilAnalysisError) {
    return <div className="text-main">Error loading data.</div>;
  }

  const oilAnalysis = selectedComponent
    ? routeComponentOilAnalysis?.data || []
    : [];

  const severityMap: Record<string, string> = Object.fromEntries(
    symbols.map((s) => [s.label, `${s.image}.png`])
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-sm font-medium">Oil Analysis</h1>
        <Dialog open={openOilAnalysis} onOpenChange={setOpenOilAnalysis}>
          <Button
            onClick={() => setOpenOilAnalysis(!openOilAnalysis)}
            type="button"
            className="w-auto font-normal text-sm cursor-text"
            variant={"outline"}
          >
            Add new oil state
          </Button>
          {openOilAnalysis && (
            <OilAnalysis
              defaultOilAnalysis="Select Oil State"
              routeComponentId={selectedComponent?.routeComponentID}
              onClose={() => setOpenOilAnalysis(false)}
            />
          )}
        </Dialog>
      </div>
      <div className="border rounded-lg flex overflow-auto ">
        {Array.from({ length: 5 }).map((_, index) => {
          const oil = oilAnalysis[index] || null;

          return (
            <div key={index} className="flex flex-col border-r w-full">
              <h1 className="text-sm font-semibold text-zinc-800 px-3 py-1 text-center border-b">
                {index === 0 ? "Current" : "Previous"}
              </h1>
              <div className="flex justify-center items-center py-1">
                {showLoading ? (
                  <Skeleton className="w-5 h-5 animate-pulse bg-zinc-200" />
                ) : oil ? (
                  <Image
                    src={`/severity/${severityMap[String(oil.analysis)]}`}
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

export default OilAnalysisSection;
