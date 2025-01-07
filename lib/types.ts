import { DatePickerProps } from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import React from "react";
import dayjs from "./utils/dayjs";

export type Configuration = {
  locale: 'fr' | 'en' | 'es';
  selectAllText?: string;
  unselectAllText?: string;
  clearFilterText?: string;
  pullSelectedToTop?: boolean;
  okText?: string;
  allowClear?: boolean;
  countBadgeThreshold?: number;
}

export type OptionWithChildren = {
  label: string;
  options: BaseOption[];
}

export type BaseOption = {
  value: string;
  label: string;
  children?: React.ReactNode[] | React.ReactNode;
}

export type OptionType = BaseOption | OptionWithChildren;

export type DateInputProps = {
  type: "date";
  inputProps?: {
    className?: string;
    format?: string | ((value: dayjs.Dayjs) => string);
  } & Omit<DatePickerProps, "format">;
};

export type DatePickerInputProps = {
  type: "daterange";
  inputProps?: {
    className?: string;
  } & RangePickerProps;
};

export type SelectInputProps = {
  type: "select";
  inputProps?: {
    options: OptionType[];
    multiple?: boolean;
    countBadgeThreshold?: number;
    allowClear?: boolean;
    allowSearch?: boolean;
    okText?: string;
    searchPlaceholder?: string;
    noOptionsFound?: string;
    selectAllText?: string;
    unselectAllText?: string;
    className?: string;
  };
};

export type StringInputProps = {
  type: "string";
  inputProps?: {
    placeholder?: string;
    className?: string;
  };
};

export type BooleanInputProps = {
  type: "boolean";
  inputProps?: {
    placeholder?: string;
    className?: string;
    inverted?: boolean;
    text: string;
  };
};

export type KeywordsLoadOptionsProps = {
  include: {
    keywords: string[];
    matchType: string
  },
  exclude: {
    keywords: string[];
    matchType: string;
  }
};

export type KeywordsInputProps = {
  type: "keywords";
  inputProps: {
    loadOptions: (props: KeywordsLoadOptionsProps) => Promise<string[]>;
    showReset?: boolean;
    showCancel?: boolean;
    defaultMatchType?: string;
    i18n?: {
      includeText?: string;
      excludeText?: string;
      matchText?: string;
      allText?: string;
      anyText?: string;
      keywordsText?: string;
      clearText?: string;
      cancelText?: string;
      searchText?: string;
    }
  };
};

export type InputType =
  | DatePickerInputProps
  | SelectInputProps
  | DateInputProps
  | StringInputProps
  | BooleanInputProps
  | KeywordsInputProps;

export type FieldItemType = {
  label?: string;
  title?: string;
  icon?: React.ReactNode | string;
  toggleable?: boolean;
  input: InputType;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
};

export type FieldType = {
  defaultValue?: unknown;
} & FieldItemType;

// @ts-ignore
export type FieldSchema<T extends Record<string, any>> =
  | ({
      name: string;
    } & FieldType)
  | ({
      name: Array<string>;
    } & FieldItemType & {
        input: DatePickerInputProps;
      });

export type InlineFilterSchema<T extends Record<string, any>> = Array<FieldSchema<T>>;

export type FilterTogglerType = {
  key: string;
  text?: string;
  showCount?: boolean;
  allowSearch?: boolean;
  defaultValue?: string[];
  position?: 'default' | 'before' | 'after';
  mode?: 'default' | 'hidden' | 'visible';
  selectAllText?: string;
  cancelText?: string;
  okText?: string;
  icon?: React.ReactNode | string;
  iconPosition?: 'before' | 'after';
};
