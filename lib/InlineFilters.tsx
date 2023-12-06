// @ts-nocheck
import { useDebounceFn, useLocalStorageState } from "ahooks";
import { Button, Space } from "antd";
import omit from "lodash/omit";
import React, { useEffect, useState } from "react";
import FilterToggler from "./FilterToggler";
import { filterForType } from "./_utils";
import SelectFilter from "./fields/SelectFilter";
import { FilterTogglerType, InlineFilterSchema } from "./types";

interface BaseInlineFilters {
  schema: InlineFilterSchema;
  delay?: number;
  resetText?: string;
  debug?: boolean;
  toggle?: FilterTogglerType;
  onReset: () => void;
  onChange: (object: any) => void;
}

interface InlineFiltersWithDefaultValue extends BaseInlineFilters {
  defaultValue: any;
  value?: any;
}

interface InlineFiltersWithValue extends BaseInlineFilters {
  defaultValue?: any;
  value: any;
}

const InlineFilters: React.FC<
  InlineFiltersWithDefaultValue | InlineFiltersWithValue
> = (props) => {
  const {
    schema,
    value = undefined,
    defaultValue = undefined,
    debug = false,
    delay = 200,
    resetText,
    toggle,
    onReset,
  } = props;

  const [hiddenFilters, setHiddenFilters] = useLocalStorageState<string[]>(
    toggle?.key ? `${toggle?.key}-filters` : "filter-toggle"
  );
  const [internalValue, setInternalValue] = useState(value || defaultValue);

  useEffect(() => {
    if(value) setInternalValue(value);
  }, [value]);

  const { run: handleChange } = useDebounceFn(
    (values) => {
      if (debug) console.log("INLINE FILTERS / handleChange", values);
      if (props.onChange) props.onChange(values);
    },
    { wait: delay }
  );

  const submitValues = (values: any) => {
    setInternalValue(values);
    handleChange(values);
  };

  const onFilterChange = (values: any) =>
    submitValues(
      omit(
        {
          ...internalValue,
          ...values,
        },
        toggle ? hiddenFilters : []
      )
    );

  const onFilterToggleChange = (names: string[]) => {
    setHiddenFilters(names);
    submitValues(
      omit(
        {
          ...internalValue,
        },
        toggle ? names : []
      )
    );
  };

  let fields = schema;
  if (toggle && hiddenFilters && hiddenFilters.length > 0)
    fields = fields.filter(
      (f) =>
        (f.toggleable !== undefined && !f.toggleable) ||
        !hiddenFilters.includes(
          Array.isArray(f.name) ? f.name.join("//=") : f.name
        )
    );

  return (
    <Space style={{ width: "100%" }} wrap>
      {fields.map((field) => {
        const FilterComponent = filterForType[field.input.type] || SelectFilter;
        return (
          <FilterComponent
            key={Array.isArray(field.name) ? field.name.join("--") : field.name}
            field={field}
            value={
              Array.isArray(field.name)
                ? field.name.reduce((acc: any, name: string) => {
                    acc[name] = internalValue[name];
                    return acc;
                  }, {})
                : internalValue[field.name]
            }
            onChange={onFilterChange}
          />
        );
      })}
      {toggle && (
        <FilterToggler
          schema={schema}
          value={hiddenFilters}
          onChange={onFilterToggleChange}
          {...(toggle || {})}
        />
      )}
      {onReset && (
        <Button type="text" onClick={onReset}>
          {resetText || "Reset filters"}
        </Button>
      )}
    </Space>
  );
};

export default InlineFilters;
