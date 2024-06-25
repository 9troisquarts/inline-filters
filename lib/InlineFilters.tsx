// @ts-nocheck
import { useDebounceFn, useLocalStorageState } from "ahooks";
import { Button, ButtonProps, Space } from "antd";
import omit from "lodash/omit";
import React, { cloneElement, useEffect, useState } from "react";
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
  resetButton?: React.ReactNode;
  resetButtonProps?: ButtonProps;
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
    defaultValue = {},
    debug = false,
    delay = 200,
    resetText,
    toggle,
    resetButton,
    resetButtonProps = {},
    onReset,
  } = props;

  const [hiddenFilters, setHiddenFilters] = useLocalStorageState<string[]>(
    toggle?.key ? `${toggle?.key}-filters` : "filter-toggle"
  );
  const [internalValue, setInternalValue] = useState(value || defaultValue);

  useEffect(() => {
    if(value) setInternalValue(value);
  }, [value]);

  const handleReset = () => {
    if (onReset) {
      if (!value) setInternalValue({});
      onReset();
    }
  }

  const { run: handleChange } = useDebounceFn(
    (values) => {
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

  let resetComponent = (
    <Button type="text" {...resetButtonProps} onClick={handleReset}>
      {resetText || "Reset filters"}
    </Button>
  ) 
  if (resetButton) resetComponent = cloneElement(resetButton, { onClick: handleReset });

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
      {onReset && resetComponent}
    </Space>
  );
};

export default InlineFilters;