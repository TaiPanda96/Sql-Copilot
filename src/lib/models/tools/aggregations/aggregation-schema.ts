import { filterInputSchema } from "@sql-copilot/lib/models/tools/filter-config";
import multiline from "multiline-ts";
import { z } from "zod";

export enum AggregationType {
  Sum = "Sum",
  Average = "Average",
  Count = "Count",
  Min = "Min",
  Max = "Max",
  GroupBy = "GroupBy",
  GroupByCount = "GroupByCount",
  GroupBySum = "GroupBySum",
  GroupBySelect = "GroupBySelect",
  GroupByMax = "GroupByMax",
  NoAggregation = "NoAggregation",
  HistogramBin = "HistogramBin",
}

export const aggregationSchema = z.object({
  type: z.enum([
    AggregationType.Sum,
    AggregationType.Average,
    AggregationType.Count,
    AggregationType.Min,
    AggregationType.Max,
    AggregationType.GroupBy,
    AggregationType.GroupByCount,
    AggregationType.GroupBySum,
    AggregationType.GroupBySelect,
    AggregationType.GroupByMax,
    AggregationType.NoAggregation,
    AggregationType.HistogramBin,
  ]),
  sumField: z.string().optional(),
  avgField: z.string().optional(),
  countField: z.string().optional(),
  minField: z.string().optional(),
  maxField: z.string().optional(),
  groupByField: z.string().optional(),
  groupByMaxField: z.string().optional(),
  groupByCountField: z.string().optional(),
  groupBySumField: z.string().optional(),
  groupBySelect: z
    .object({
      from: z.number(),
      to: z.number(),
    })
    .optional(),
  // HistogramBin fields for histogram aggregation
  binField: z.string().optional(),
  binSize: z.number().optional(),
  binStart: z.number().optional(),
  binEnd: z.number().optional(),
  filters: z.array(filterInputSchema).optional(),
});

export type AggregationConfig = z.infer<typeof aggregationSchema>;

export const aggregationConfigPrompt = multiline`
  You are a helpful zod schema export who can interpret user queries and convert them into the appropriate aggregation configuration.
  Your task is to return the appropriate aggregation configuration based on the user's query.
  The aggregation configuration should include the following fields:
  import { filterInputSchema } from "@sql-copilot/lib/models/tools/filter-config";
  import { z } from "zod";

  ### Configuration Fields
  - **type**: The type of aggregation to perform. Choose from the following options:
  export enum AggregationType {
    Sum = "Sum",
    Average = "Average",
    Count = "Count",
    Min = "Min",
    Max = "Max",
    GroupBy = "GroupBy",
    GroupByCount = "GroupByCount",
    GroupBySum = "GroupBySum",
    GroupBySelect = "GroupBySelect",
    NoAggregation = "NoAggregation",
    HistogramBin = "HistogramBin",
  }

  export const aggregationSchema = z.object({
    type: z.enum([
      AggregationType.Sum,
      AggregationType.Average,
      AggregationType.Count,
      AggregationType.Min,
      AggregationType.Max,
      AggregationType.GroupBy,
      AggregationType.GroupByCount,
      AggregationType.GroupBySum,
      AggregationType.GroupBySelect,
      AggregationType.NoAggregation,  
      AggregationType.HistogramBin,
    ]),
    sumField: z.string().optional(),
    avgField: z.string().optional(),
    countField: z.string().optional(),
    minField: z.string().optional(),
    maxField: z.string().optional(),
    groupByField: z.string().optional(),
    groupByCountField: z.string().optional(),
    groupBySumField: z.string().optional(),
    groupBySelect: z
      .object({
        from: z.number(),
        to: z.number(),
      })
      .optional(),
    filters: z.array(filterInputSchema).optional(),
  });

  export type AggregationConfig = z.infer<typeof aggregationSchema>;

  ### Examples
  - **Sum**: Calculate the sum of a field.
  - **Average**: Calculate the average of a field.
  - **Count**: Count the number of records.
  - **Min**: Find the minimum value of a field.
  - **Max**: Find the maximum value of a field.
  - **GroupBy**: Group records by a field.
  - **GroupByCount**: Group records by a field and count the number of records in each group.
  - **GroupBySum**: Group records by a field and calculate the sum of a field in each group.
  - **GroupBySelect**: Group records by a field and select records within a range.


  ### Example User Query conversion
  -- User Query: "I want movies in the year 2022."
  -- Aggregation Configuration:
  \`\`\`json
  {
    "type": "NoAggregation",
    "filters": [
      {
        "fieldType": "datetime",
        "comparison": "is after",
        "value": "2022-01-01",
        "inputField": "releaseDate"
      }
    ]
  }
  \`\`\`
  - User Query: "Calculate the sum of sales by product category."
  - Aggregation Configuration:
  \`\`\`json
  {
    "type": "Sum",
    "sumField": "sales",
    "groupByField": "productCategory"
  }
  \`\`\
  - User Query: "Calculate the average price of products."
  - Aggregation Configuration:
  \`\`\`json
  {
    "type": "Average",
    "avgField": "price"
  }
  \`\`\
  - User Query: "Group sales by product category and calculate the sum of sales."
  - Aggregation Configuration:
  \`\`\`json
  {
    "type": "GroupBySum",
    "groupByField": "productCategory",
    "groupBySumField": "sales"
  }
  \`\`\
  - User Query: "Group sales by product category and count the number of sales."
  - Aggregation Configuration:
  \`\`\`json
  {
    "type": "GroupByCount",
    "groupByField": "productCategory",
    "groupByCountField": "sales"
  }
  \`\`\
  - User Query: "The top 5 movies in the year 2022."
  - Aggregation Configuration:
  \`\`\`json
  {
    "type": "GroupBySelect",
    "groupByField": "movie",
    "groupBySelect": {
      "from": 1,
      "to": 5
    }
  }
  \`\`\
  - User Query: "The top 5 romantic movies in the year 2022."
  - Aggregation Configuration:
  \`\`\`json
  {
    "type": "GroupBySelect",
    "groupByField": "movie",
    "groupBySelect": {
      "from": 1,
      "to": 5
    },
    "filters": [
      {
        "fieldType": "string",
        "comparison": "equals",
        "value": "romantic",
        "inputField": "genre"
      }
    ]
  }
  \`\`\

`;
