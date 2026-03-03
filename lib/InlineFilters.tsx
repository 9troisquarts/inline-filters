import { useDebounceFn, useLocalStorageState } from "ahooks";
import { Button, ButtonProps, ConfigProvider } from "antd";
import en_GB from "antd/lib/locale/en_GB";
import es_ES from "antd/lib/locale/es_ES";
import fr_FR from "antd/lib/locale/fr_FR";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import { isEqual, pick } from "lodash";
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import FilterToggler from "./FilterToggler";
import {
  defaultContainerStyle,
  extractToggledFields,
  filterForType,
  isUntoggleable,
  objectIsPresent,
} from "./_utils";
import SelectFilter from "./fields/SelectFilter";
import {
  Configuration,
  FieldSchema,
  FilterTogglerType,
  InlineFilterSchema,
} from "./types";
import dayjs from "./utils/dayjs";

let config: Configuration = {
  locale: "fr",
  selectAllText: "Sélectionner tout",
  clearFilterText: "Clear",
  unselectAllText: "Désélectionner tout",
  okText: "Rechercher",
  pullSelectedToTop: true,
  countBadgeThreshold: 0,
  allowClear: false,
};

const antdLocaleForLocale = {
  fr: fr_FR,
  en: en_GB,
  es: es_ES,
};

export type InlineFiltersResetButtonVisibility = "always" | "never" | "dirty";
export type InlineFiltersLayout = "inline" | "vertical";

export type BaseInlineFilters<T extends Record<string, any>> = {
  schema: InlineFilterSchema;
  delay?: number;
  resetText?: string;
  debug?: boolean;
  toggle?: FilterTogglerType;
  resetButton?: React.ReactNode;
  resetButtonProps?: ButtonProps;
  // Always show the reset button, never show it, or show it only when filters are set
  resetButtonVisibility?: InlineFiltersResetButtonVisibility;
  containerStyle?: React.CSSProperties;
  onReset?: () => void;
  onChange: (object: T, value: T) => void;
  flexGap?: string | number;
  /** "inline" (default): items in a row, wrap on small screens. "vertical": stacked. */
  layout?: InlineFiltersLayout;
};

export type InlineFiltersWithDefaultValue<T extends Record<string, any>> = {
  defaultValue: T;
  value?: T;
  config?: Configuration;
} & BaseInlineFilters<T>;

export type InlineFiltersWithValue<T extends Record<string, any>> = {
  defaultValue?: T;
  value: T;
  config?: Configuration;
} & BaseInlineFilters<T>;

export type InlineFiltersProps<T extends Record<string, unknown>> =
  | InlineFiltersWithDefaultValue<T>
  | InlineFiltersWithValue<T>;

const InlineFilters = <T extends Record<string, any>>(
  props: InlineFiltersWithDefaultValue<T> | InlineFiltersWithValue<T>
) => {
  const {
    schema,
    value = undefined,
    defaultValue = {},
    delay = 200,
    resetText,
    toggle,
    resetButtonVisibility = "dirty",
    resetButton,
    resetButtonProps = {},
    layout = "inline",
    onReset,
    flexGap = "1rem",
    containerStyle = {},
  } = props;

  const [filtersToggled, setFiltersToggled] = useLocalStorageState<string[]>(
    toggle?.key
      ? `${toggle?.key}-${toggle?.mode || "default"}-filters`
      : `filter-${toggle?.mode || "default"}-toggle`,
    {
      defaultValue: toggle?.defaultValue || [],
    }
  );
  const [internalValue, setInternalValue] = useState<T>(
    (value || defaultValue) as T
  );

  const fieldsToPick = useMemo(() => {
    if (!toggle) return [];
    if (toggle?.mode === "visible") {
      return schema
        .filter(isUntoggleable)
        .flatMap((f) => f.name)
        .concat(filtersToggled || [])
        .flatMap((f) => f.toString().split("//="));
    } else {
      const filtersToGet = schema.flatMap((f) => f.name);
      return filtersToGet
        .filter((f) => !filtersToggled?.includes(f.toString()))
        .flatMap((f) => f.toString().split("//="));
    }
  }, [filtersToggled?.join("//=")]);

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

  const onFilterChange = useCallback(
    (values: any) => {
      let nextValues = {
        ...internalValue,
        ...values,
      };
      if (toggle) {
        nextValues = pick(nextValues, toggle ? fieldsToPick : []);
      }
      if (!isEqual(nextValues, internalValue)) submitValues(nextValues, values);
    },
    [internalValue, fieldsToPick]
  );

  const onFilterToggleChange = useCallback(
    (toggleableNames: string[]) => {
      setFiltersToggled(toggleableNames);
    },
    [internalValue, fieldsToPick]
  );

  useEffect(() => {
    onFilterChange({});
  }, [fieldsToPick]);

  useEffect(() => {
    if (value) setInternalValue(value);
  }, [value]);

  const handleReset = () => {
    if (onReset) {
      if (!value) setInternalValue({} as T);
      onReset();
    }
  };

  let resetComponent = (
    <Button type="text" {...resetButtonProps} onClick={handleReset}>
      {resetText || "Reset filters"}
    </Button>
  );
  // @ts-ignore
  if (resetButton)
    resetComponent = cloneElement(resetButton as React.ReactElement, { onClick: handleReset });

  const fields = useMemo(() => {
    if (toggle) {
      return extractToggledFields(
        schema,
        filtersToggled || [],
        toggle?.mode || "default"
      );
    }
    return schema;
  }, [schema, filtersToggled]);

  const configuration = {
    ...config,
    ...(props.config || {}),
  };

  dayjs.locale(configuration.locale);

  const ToggleComponent = toggle ? (
    <FilterToggler
      schema={schema}
      value={filtersToggled}
      onChange={onFilterToggleChange}
      {...(toggle || {})}
    />
  ) : undefined;

  const showResetButton =
    onReset &&
    (resetButtonVisibility === "always" ||
      (resetButtonVisibility == "dirty" &&
        internalValue &&
        objectIsPresent(internalValue)));

  const currentContainerStyle: React.CSSProperties = {
    ...defaultContainerStyle,
    ...containerStyle,
    ...(containerStyle?.flexWrap ? { flexWrap: containerStyle.flexWrap } : { flexWrap: layout === "vertical" ? "nowrap" : "wrap" }),
    ...(containerStyle?.gap ? { gap: containerStyle.gap } : { gap: flexGap }),
    ...(containerStyle?.flexDirection ? { flexDirection: containerStyle.flexDirection } : { flexDirection: layout === "vertical" ? "column" : "row" }),
    ...(containerStyle?.alignItems ? { alignItems: containerStyle.alignItems } : { alignItems: layout === "vertical" ? "stretch" : "flex-start" }),
  };

  const itemStyle: React.CSSProperties = {
    minWidth: 0,
    maxWidth: "100%",
  };

  return (
    <ConfigProvider locale={antdLocaleForLocale[config.locale]}>
      <div style={currentContainerStyle}>
        {toggle && toggle?.position === "before" && (
          <div style={itemStyle}>{ToggleComponent}</div>
        )}
        {fields.map((field: FieldSchema) => {
          const FilterComponent =
            filterForType[field.input.type] || SelectFilter;
          return (
            <div
              key={
                Array.isArray(field.name) ? field.name.join("--") : field.name
              }
              style={itemStyle}
            >
              <FilterComponent
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
            </div>
          );
        })}
        {toggle && toggle?.position !== "before" && (
          <div style={itemStyle}>{ToggleComponent}</div>
        )}
        {showResetButton && <div style={itemStyle}>{resetComponent}</div>}
      </div>
    </ConfigProvider>
  );
};

export const configure = (configuration: Configuration) => {
  config = { ...config, ...configuration };
  return config;
};

export default InlineFilters;
