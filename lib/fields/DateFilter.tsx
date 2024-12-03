import React, { useEffect, useState } from 'react';
import { DateInputProps, FieldSchema } from '../types';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';
import '../index.css';
import dayjs from '../utils/dayjs';

const DatePicker = generatePicker<dayjs.Dayjs>(dayjsGenerateConfig);

type FilterProps = {
  field: FieldSchema<any> & { name: string };
  value?: dayjs.Dayjs | string;
  onChange: (values: {
    [k: string]: dayjs.Dayjs | string | undefined | null;
  }) => void;
};

const castDefaultValue = (value?: string | dayjs.Dayjs) => {
  if(!value) return undefined

  if (dayjs.isDayjs(value)) return value;
  if (dayjs(value).isValid()) return dayjs(value);
}

const DateFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    onChange,
  } = props;

  const {
    inputProps = {}
  } = (field.input || {}) as DateInputProps;

  const [internalValue, setInternalValue] = useState<dayjs.Dayjs | undefined | null>(castDefaultValue(value));

  useEffect(() => {
    setInternalValue(castDefaultValue(value));
  }, [value]);

  const handleChange = (date: dayjs.Dayjs | null) => {
    setInternalValue(date);
    onChange({ [field.name]: date });
  }

  return (
    // @ts-expect-error: DatePicker is not typed correctly
    <DatePicker
      {...inputProps}
      placeholder={field.label}
      className={`wand__inline-filter__datepicker ${internalValue ? 'wand__inline-filter__datepicker--filled' : ''}`}
      value={internalValue}
      onChange={handleChange}
    />
  )
}

export default DateFilter;
