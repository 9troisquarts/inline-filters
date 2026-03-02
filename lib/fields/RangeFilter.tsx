import React, { useEffect, useState } from 'react';
import { FieldSchema, RangeInputProps, Configuration } from '../types';
import { Slider, Space, Tooltip, Popover } from 'antd';
import SVG from 'react-inlinesvg';
import '../index.css';
import circleXMark from '../icons/circle-xmark.svg';
import { isDirty } from '../_utils';
import { isEqual } from 'lodash';

type ValueType = [number, number] | undefined;

type FilterProps = {
  field: FieldSchema & { name: string };
  value?: ValueType;
  defaultConfig: Configuration;
  onChange: (values: {
    [k: string]: ValueType;
  }) => void;
};

const RangeFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    defaultConfig,
    onChange,
  } = props;

  const {
    inputProps: {
      min = 0,
      max = 100,
      step = 1,
      marks,
      allowClear = true,
      tipFormatter,
      included = true
    } = {},
  } = (field.input || {}) as RangeInputProps;

  const [internalValue, setInternalValue] = useState<ValueType>(value);
  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: number | number[]) => {
    const rangeValue = Array.isArray(newValue) ? newValue as [number, number] : undefined;
    setInternalValue(rangeValue);
  };

  const handleAfterChange = (newValue: number | number[]) => {
    const rangeValue = Array.isArray(newValue) ? newValue as [number, number] : undefined;
    setInternalValue(rangeValue);
  };

  const onReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue(undefined);
    onChange({ [field.name]: undefined });
  };

  const handleOpenChange = (visible: boolean) => {
    setPopoverIsOpen(visible);
    if (!visible && !isEqual(value, internalValue)) {
      // Appliquer les changements à la fermeture de la popover
      if (isDirty(internalValue, value)) {
        onChange({ [field.name]: internalValue });
      }
    }
  };

  const hasValue = value && Array.isArray(value) && value.length === 2;
  const displayText = hasValue ? `${value[0]} - ${value[1]}` : '';

  const popoverContent = (
    <div style={{ width: 280, padding: '12px 16px' }}>
      <Slider
        range
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        onAfterChange={handleAfterChange}
        marks={marks}
        tipFormatter={tipFormatter}
        included={included}
      />
    </div>
  );

  return (
    <Popover
      showArrow={false}
      open={popoverIsOpen}
      content={popoverContent}
      placement="bottom"
      onOpenChange={handleOpenChange}
      trigger="click"
      overlayClassName="wand__inline-filter__popover"
    >
      <div className={`wand__inline-filter__filter ${hasValue ? 'wand__inline-filter__filter--filled' : ''} ${hasValue || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
        <Space>
          <span className="wand__inline-filter__label">
            {field.label}
            {hasValue && (
              <span>
                &nbsp;:&nbsp;{displayText}
              </span>
            )}
            {field.icon && !hasValue && (
              <span style={{ marginLeft: 8 }}>
                {field.icon}
              </span>
            )}
            {allowClear && hasValue && (
              <>
                &nbsp;
                <Tooltip
                  title={defaultConfig.clearFilterText || 'Effacer le filtre'}
                >
                  <a className="wand__inline-filter-close-mark" onClick={onReset}>
                    <SVG src={circleXMark} height={14} />
                  </a>
                </Tooltip>
              </>
            )}
          </span>
        </Space>
      </div>
    </Popover>
  );
};

export default RangeFilter;