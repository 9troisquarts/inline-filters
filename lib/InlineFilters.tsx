// @ts-nocheck
import { useDebounceFn, useLocalStorageState } from "ahooks";
import { Button, ButtonProps, ConfigProvider, Space } from "antd";
import omit from "lodash/omit";
import React, { cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import FilterToggler from "./FilterToggler";
import { filterForType } from "./_utils";
import SelectFilter from "./fields/SelectFilter";
import { Configuration, FieldSchema, FilterTogglerType, InlineFilterSchema } from "./types";
import fr_FR from 'antd/lib/locale/fr_FR';
import en_GB from 'antd/lib/locale/en_GB';
import es_ES from 'antd/lib/locale/es_ES';
import { filter, pick } from "lodash";

let config: Configuration = {
  locale: 'fr',
  selectAllText: 'Sélectionner tout',
  clearFilterText: "Clear",
  unselectAllText: 'Désélectionner tout',
  okText: 'Rechercher',
  pullSelectedToTop: true,
  countBadgeThreshold: 0,
  allowClear: false,
  toggleMode: 'hidden'
};

const antdLocaleForLocale = {
  fr: fr_FR,
  en: en_GB,
  es: es_ES,
};

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
  config?: Configuration;
}

interface InlineFiltersWithValue extends BaseInlineFilters {
  defaultValue?: any;
  value: any;
  config?: Configuration;
}

const isToggleable = (f: FieldSchema) => f.name && (f.toggleable || f.toggleable === undefined)
const isUntoggleable = (field: FieldSchema) => !isToggleable(field);

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

  const [filtersToggled, setFiltersToggled] = useLocalStorageState<string[]>(
    toggle?.key ? `${toggle?.key}-${toggle?.mode}-filters` : `filter-${toggle?.mode}-toggle`
  );
  const [internalValue, setInternalValue] = useState(value || defaultValue);

  useEffect(() => {
    if(value) setInternalValue(value);
  }, [value]);

  const fieldsToPick = useMemo(() => {
    if (!toggle) return [];
    if (toggle?.mode === "visible") {
      return schema.filter(isUntoggleable).flatMap(f => f.name).concat(filtersToggled || []);
    } else {
      const filtersToGet = schema.flatMap(f => f.name);
      return filtersToGet.filter(f => !filtersToggled?.includes(f));
    }
  }, [filtersToggled?.join('//=')]);

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

  const onFilterChange = useCallback((values: any) => {
    let nextValues = {
      ...internalValue,
      ...values,
    };
    if (toggle) {
      nextValues = pick(
        nextValues,
        toggle ? fieldsToPick : []
      )
    }
    submitValues(
      nextValues
    );
  }, [internalValue, fieldsToPick]);

  const onFilterToggleChange = (names: string[]) => {
    setFiltersToggled(names);
    const nextValues = pick(
      {
        ...internalValue,
      },
      toggle ? names : []
    );
    submitValues(
      nextValues
    );
  };

  let resetComponent = (
    <Button type="text" {...resetButtonProps} onClick={handleReset}>
      {resetText || "Reset filters"}
    </Button>
  ) 
  if (resetButton) resetComponent = cloneElement(resetButton, { onClick: handleReset });


  const extractToggledFields = (schema: InlineFilterSchema, currentValue: string[], mode: 'default' | 'hidden' | 'visible') => {
    if( mode === 'default' || mode === 'hidden') {
      if (currentValue && currentValue.length > 0) {
        return schema.filter(
          (f) =>
            (f.toggleable !== undefined && !f.toggleable) ||
            !currentValue.includes(
              Array.isArray(f.name) ? f.name.join("//=") : f.name
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
              Array.isArray(f.name) ? f.name.join("//=") : f.name
            )
        );
      }
      return schema.filter(f => f && f.toggleable !== undefined && !f.toggleable);
    }
    return schema;
  }

  const fields = useMemo(() => {
    if(toggle) {
      return extractToggledFields(schema, filtersToggled, toggle?.mode || 'default')
    }
    return schema;
  }, [schema, filtersToggled]);

  const configuration = {
    ...config,
    ...(props.config || {})
  }

  const ToggleComponent = toggle ? (
    <FilterToggler
      schema={schema}
      value={filtersToggled}
      onChange={onFilterToggleChange}
      {...(toggle || {})}
    />
  ) : undefined;

  return (
    <ConfigProvider locale={antdLocaleForLocale[config.locale]}>
      <Space style={{ width: "100%" }} wrap>
        {toggle && (toggle?.position === "before") && (
          ToggleComponent
        )}
        {fields.map((field) => {
          const FilterComponent = filterForType[field.input.type] || SelectFilter;
          return (
            <FilterComponent
              key={Array.isArray(field.name) ? field.name.join("--") : field.name}
              field={field}
              defaultConfig={configuration}
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
        {toggle && (toggle?.position !== "before") && (
          ToggleComponent
        )}
        {onReset && resetComponent}
      </Space>
    </ConfigProvider>
  );
};

export const configure = (configuration: Configuration) => {
  config = { ...config, ...configuration };
  return config;
};

export default InlineFilters;