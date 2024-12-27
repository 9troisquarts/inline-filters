import { Space } from "antd";
import BooleanFilter from "./fields/BooleanFilter";
import DateFilter from "./fields/DateFilter";
import DateRangeFilter from "./fields/DateRangeFilter";
import SelectFilter from "./fields/SelectFilter";
import StringFilter from "./fields/StringFilter";
import KeywordsFilter from "./fields/KeywordsFilter";
import { FieldSchema, InlineFilterSchema } from "./types";
import AsyncSelectFilter from "./fields/AsyncSelectFilter";

const renderDate = () => {
  return <Space>Render date</Space>;
};

export const isToggleable = (f: FieldSchema) => f.name && (f.toggleable || f.toggleable === undefined)
export const isUntoggleable = (field: FieldSchema) => !isToggleable(field);
export const objectIsPresent = (obj: any) => {
  return obj && typeof obj === "object" && Object.keys(obj).some((key) => !!obj[key]);
}

export const renderValue = (props: { field: { label: string } }) => {
  const { field } = props;
  return <Space>{field.label}</Space>;
};

export const renderValueForType = {
  date: renderDate,
};

export const extractToggledFields = (schema: InlineFilterSchema<any>, currentValue: string[], mode: 'default' | 'hidden' | 'visible') => {
  if( mode === 'default' || mode === 'hidden') {
    if (currentValue && currentValue.length > 0) {
      return schema.filter(
        (f) =>
          (f.toggleable !== undefined && !f.toggleable) ||
          !currentValue.includes(
            Array.isArray(f.name) ? f.name.join("//=") : f.name.toString()
          )
      );
    }
  }
  if(mode === 'visible') {
    if (currentValue && currentValue.length > 0) {
      return schema.filter(
        (f) =>
          (f.toggleable !== undefined && !f.toggleable) ||
          currentValue.includes(
            Array.isArray(f.name) ? f.name.join("//=") : f.name.toString()
          )
      );
    }
    return schema.filter(f => f && f.toggleable !== undefined && !f.toggleable);
  }
  return schema;
}

export const filterForType = {
  date: DateFilter,
  string: StringFilter,
  boolean: BooleanFilter,
  daterange: DateRangeFilter,
  select: SelectFilter,
  keywords: KeywordsFilter,
  asyncSelect: AsyncSelectFilter
};
