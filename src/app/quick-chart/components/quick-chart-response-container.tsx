import { Messages } from "@sql-copilot/gen/prisma";
import { camelCase } from "lodash";
import { LoaderCircle } from "lucide-react";
import { DynamicChart, ChartType } from "../../../lib/components/dynamic-chart";
import { MessageList } from "../../../lib/components/message-list";
import { RenderAnimationContainer } from "../../../lib/components/render-animation-container";
import { ChartConfig } from "../actions/quick-chart-input";

export function QuickChartResponseContainer({
  chartConfig,
  loading,
  messages,
  error,
}: {
  chartConfig: ChartConfig | null;
  loading: boolean;
  messages: Messages[];
  error: string | null;
}) {
  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {messages.length
          ? messages.map((msg) => (
              <MessageList key={msg.id} message={msg.message} />
            ))
          : null}
      </div>
      {loading && <LoaderCircle />}
      {/* Visualization */}
      {chartConfig && !loading && (
        <RenderAnimationContainer>
          <DynamicChart
            chartConfig={{
              ...chartConfig,
              type: chartConfig.type as ChartType,
              data: chartConfig.data.map((item) => {
                const newItem: { [key: string]: any } = {};
                Object.keys(item).forEach((key) => {
                  newItem[camelCase(key)] = item[key];
                });
                return newItem;
              }),
              xKey: camelCase(chartConfig.xKey),
              yKey: camelCase(chartConfig.yKey),
            }}
          />
        </RenderAnimationContainer>
      )}
    </>
  );
}
