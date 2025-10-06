import { useDebounceFn, useLocalStorageState } from "ahooks";
import { Button, ButtonProps, ConfigProvider } from "antd";
import React, { cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import FilterToggler from "./FilterToggler";
import { extractToggledFields, filterForType, isUntoggleable, objectIsPresent } from "./_utils";
import SelectFilter from "./fields/SelectFilter";
import { Configuration, FieldSchema, FilterTogglerType, InlineFilterSchema } from "./types";
import fr_FR from 'antd/lib/locale/fr_FR';
import en_GB from 'antd/lib/locale/en_GB';
import es_ES from 'antd/lib/locale/es_ES';
import { isEqual, pick } from "lodash";
import dayjs from "./utils/dayjs";
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

let config: Configuration = {
  locale: 'fr',
  selectAllText: 'Sélectionner tout',
  clearFilterText: "Clear",
  unselectAllText: 'Désélectionner tout',
  okText: 'Rechercher',
  pullSelectedToTop: true,
  countBadgeThreshold: 0,
  allowClear: false
};

const antdLocaleForLocale = {
  fr: fr_FR,
  en: en_GB,
  es: es_ES,
};

type BaseInlineFilters<T extends Record<string, any>> = {
  schema: InlineFilterSchema;
  className?: string;
  delay?: number;
  resetText?: string;
  debug?: boolean;
  toggle?: FilterTogglerType;
  resetButton?: React.ReactNode;
  resetButtonProps?: ButtonProps;
  // Always show the reset button, never show it, or show it only when filters are set
  resetButtonVisibility?: "always" | "never" | "dirty";
  onReset?: () => void;
  onChange: (object: T, value: T) => void;
}

type InlineFiltersWithDefaultValue<T extends Record<string, any>> = {
  defaultValue: T;
  value?: T;
  config?: Configuration;
} & BaseInlineFilters<T>;

type InlineFiltersWithValue<T extends Record<string, any>> = {
  defaultValue?: T;
  value: T;
  config?: Configuration;
} & BaseInlineFilters<T>;

const InlineFilters = <T extends Record<string, any>, >(props: InlineFiltersWithDefaultValue<T> | InlineFiltersWithValue<T>) => {
  const {
    schema,
    value = undefined,
    defaultValue = {},
    delay = 200,
    resetText,
    toggle,
    className,
    resetButtonVisibility = 'dirty',
    resetButton,
    resetButtonProps = {},
    onReset,
  } = props;

  const [filtersToggled, setFiltersToggled] = useLocalStorageState<string[]>(
    toggle?.key ? `${toggle?.key}-${toggle?.mode}-filters` : `filter-${toggle?.mode}-toggle`,
    {
      defaultValue: toggle?.defaultValue || [],
    }
  );
  const [internalValue, setInternalValue] = useState<T>((value || defaultValue) as T);

  const fieldsToPick = useMemo(() => {
    if (!toggle) return [];
    if (toggle?.mode === "visible") {
      return schema.filter(isUntoggleable).flatMap(f => f.name).concat(filtersToggled || []).flatMap((f) => f.toString().split("//="));
    } else {
      const filtersToGet = schema.flatMap(f => f.name);
      return filtersToGet.filter(f => !filtersToggled?.includes(f.toString())).flatMap(f => f.toString().split("//="));
    }
  }, [filtersToggled?.join('//=')]);

  const { run: handleChange } = useDebounceFn(
    (values, value) => {
      if (props.onChange) props.onChange(values, value);
    },
    { wait: delay }
  );

  const submitValues = (values: any, value: any) => {
    setInternalValue(values);
    handleChange(values, value);
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
    if (!isEqual(nextValues, internalValue))
      submitValues(
        nextValues,
        values
      );
  }, [internalValue, fieldsToPick]);

  const onFilterToggleChange = useCallback((toggleableNames: string[]) => {
    setFiltersToggled(toggleableNames);
  }, [internalValue, fieldsToPick]);

  useEffect(() => {
    onFilterChange({});
  }, [fieldsToPick])

  useEffect(() => {
    if(value) setInternalValue(value);
  }, [value]);

  const handleReset = () => {
    if (onReset) {
      if (!value) setInternalValue({} as T);
      onReset();
    }
  }

  let resetComponent = (
    <Button type="text" {...resetButtonProps} onClick={handleReset}>
      {resetText || "Reset filters"}
    </Button>
  ) 
  // @ts-ignore
  if (resetButton) resetComponent = cloneElement(resetButton, { onClick: handleReset });

  const fields = useMemo(() => {
    if(toggle) {
      return extractToggledFields(schema, filtersToggled || [], toggle?.mode || 'default')
    }
    return schema;
  }, [schema, filtersToggled]);

  const configuration = {
    ...config,
    ...(props.config || {})
  }

  dayjs.locale(configuration.locale);

  const ToggleComponent = toggle ? (
    <FilterToggler
      schema={schema}
      value={filtersToggled}
      onChange={onFilterToggleChange}
      {...(toggle || {})}
    />
  ) : undefined;

  const showResetButton = onReset && (resetButtonVisibility === 'always' || (resetButtonVisibility == 'dirty' && internalValue && objectIsPresent(internalValue)));

  return (
    <ConfigProvider locale={antdLocaleForLocale[config.locale]}>
      <>
        {toggle && (toggle?.position === "before") && (
          ToggleComponent
        )}
        {fields.map((field: FieldSchema) => {
          const FilterComponent = filterForType[field.input.type] || SelectFilter;
          return (
            <FilterComponent
              key={Array.isArray(field.name) ? field.name.join("--") : field.name}
              // @ts-ignore
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
      </>
      {showResetButton && resetComponent}
    </ConfigProvider>
  );
};

export const configure = (configuration: Configuration) => {
  config = { ...config, ...configuration };
  return config;
};

export default InlineFilters;