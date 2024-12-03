import React, { useEffect, useState } from 'react';
import { FieldSchema, StringInputProps } from '../types';
import { Input } from 'antd';
import '../index.css';

type FilterProps = {
  field: FieldSchema<any> & { name: string };
  value?: string;
  onChange: (values: {
    [k: string]: string | undefined | null;
  }) => void;
};

const StringFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    onChange,
  } = props;

  const {
    inputProps: {
      placeholder,
      className
    } = {},
  } = (field.input || {}) as StringInputProps;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(value);

  useEffect(() => {
    if (!value) {
      setInternalValue(undefined);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange({ [field.name]: e.target.value })
  }

  const classNames = [
    'wand__inline-filter__string-input',
    className,
    field.className,
    isFocused || (internalValue && internalValue.length > 0) ? 'wand__inline-filter__string-input--is-focused' : undefined
  ].filter(Boolean)

  return (
    <Input
      className={classNames.join(' ')}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={field.style || {}}
      value={internalValue}
      onChange={handleChange}
      addonBefore={field.icon}
      placeholder={placeholder}
    />
  )
}

export default StringFilter;
