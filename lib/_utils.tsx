import { Space } from "antd";
import BooleanFilter from "./fields/BooleanFilter";
import DateFilter from "./fields/DateFilter";
import DateRangeFilter from "./fields/DateRangeFilter";
import SelectFilter from "./fields/SelectFilter";
import StringFilter from "./fields/StringFilter";
import KeywordsFilter from "./fields/KeywordsFilter";

const renderDate = () => {
  return <Space>Render date</Space>;
};

export const renderValue = (props: { field: { label: string } }) => {
  const { field } = props;
  return <Space>{field.label}</Space>;
};

export const renderValueForType = {
  date: renderDate,
};

export const filterForType = {
  date: DateFilter,
  string: StringFilter,
  boolean: BooleanFilter,
  daterange: DateRangeFilter,
  select: SelectFilter,
  keywords: KeywordsFilter,
};
