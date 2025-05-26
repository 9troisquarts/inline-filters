import React, { useEffect, useState } from 'react';
import { Space, Checkbox } from 'antd';
import { FieldSchema } from '../types';
import '../index.css';

type FilterProps = {
  field: FieldSchema & { name: string };
  value?: boolean;
  onChange: (values: {
    [k: string]: boolean | undefined | null;
  }) => void;
};

const BooleanFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    onChange,
  } = props;

  const [internalValue, setInternalValue] = useState<boolean>(false);

  useEffect(() => {
    setInternalValue(value || false);
  }, [value]);

  const handleChange = () => {
    setInternalValue(!internalValue);
    onChange({ [field.name]: !internalValue })
  }

  return (
    <div onClick={handleChange} className={`wand__inline-filter__filter wand__inline-filter__boolean ${internalValue ? 'wand__inline-filter__boolean--checked' : ''}`}>
      <Space>
        <Checkbox checked={internalValue} />
        {field.icon && (
          <span>
            {field.icon}
          </span>
        )}
        {field.label}
      </Space>
    </div>
  )
}

export default BooleanFilter;
