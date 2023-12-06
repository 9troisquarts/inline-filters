// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { DateInputProps, FieldSchema } from '../types';
import '../index.css';
import dayjs from '../utils/dayjs';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import generatePicker from 'antd/lib/date-picker/generatePicker';

const DatePicker = generatePicker<DayjsType>(dayjsGenerateConfig)

const { RangePicker } = DatePicker;

type FilterProps = {
  field: FieldSchema;
  value: any;
  onChange: (values: any) => void;
};

type ValueType = {
  [k: string]: string | dayjs.Dayjs;
};

const DateRangeFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    onChange,
  } = props;

  const {
    inputProps = {}
  } = (field.input || {}) as DateInputProps;

  // @ts-ignore
  const [startName, endName] = field.name;
  const [internalValue, setInternalValue] = useState<ValueType>(value || {});

  useEffect(() => {
    setInternalValue(value || {})
  }, [value])

  const handleChange = (mDates: [dayjs.Dayjs, dayjs.Dayjs]) => {
    const nextValues = {
      [startName]: mDates ? mDates[0] : undefined,
      [endName]: mDates ? mDates[1] : undefined,
    }
    onChange(nextValues);
    setInternalValue(nextValues);
  }


  let from = internalValue[startName];
  if(from && !dayjs.isDayjs(from)) from = dayjs(from).startOf('day');

  let to = internalValue[endName];
  if(to && !dayjs.isDayjs(to)) to = dayjs(to).startOf('day');

  const v = [
    from,
    to
  ];

  const filled = v.filter(Boolean).length > 0;

  return (
    <RangePicker
      {...(inputProps || {})}
      className={`wand__inline-filter__datepicker ${filled ? 'wand__inline-filter__datepicker--filled' : ''}`}
      value={v}
      onChange={handleChange}
    />
  )
}

export default DateRangeFilter;
