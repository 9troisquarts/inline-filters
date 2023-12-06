// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { FieldSchema, SelectInputProps } from '../types';
import SVG from 'react-inlinesvg';
import { Badge, Checkbox, Input, InputRef, Popover, Space } from 'antd';
import { useSelections } from 'ahooks';
import scopeSvg from '../icons/scope.svg';
import '../index.css';
import filterOption from '../utils/filterOption';

type ValueType = string | string[] | undefined;

type FilterProps = {
  field: FieldSchema & { name: string };
  value?: ValueType;
  onChange: (values: {
    [k: string]: ValueType | ValueType[];
  }) => void;
};

const sortByPresenceInArray = (array: ValueType[]) => (a: any, b: any) => {
  if (array.includes(a.value) && !array.includes(b.value))
    return 1;
  if (!array.includes(a.value) && array.includes(b.value))
    return -1;
  return 0;
}

const castValue = (value?: string | string[]) => {
  if(!value) return [];

  if (Array.isArray(value)) return value;

  return [value];
}

const SelectFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    onChange,
  } = props;

  const {
    inputProps: {
      multiple = false,
      allowSearch = true,
      searchPlaceholder = undefined,
      selectAllText = 'All',
      options = [],
    } = {}
  } = (field?.input || {}) as SelectInputProps;

  const {
    selected: internalValue,
    setSelected,
    allSelected,
    partiallySelected,
    unSelectAll,
    selectAll
  } = useSelections<string | number | undefined>(options.map(o => o.value), castValue(value));

  const [search, setSearch] = useState<string | undefined>(undefined);
  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const selectRef = useRef<InputRef>(null);

  useEffect(() => {
    setSelected(castValue(value));
  }, [value, multiple]);

  useEffect(() => {
    if(selectRef && selectRef.current)  {
      setTimeout(() => {
        if(selectRef.current) selectRef.current.select();
      }, 0)
    }
  }, [popoverIsOpen])

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target?.value);
  const onSelect = (key: string) => {
    if (multiple) {
      if(internalValue.includes(key)) {
        const nextValues = [...internalValue];
        nextValues.splice(nextValues.indexOf(key), 1)
        onChange({ [field.name]: nextValues })
      } else {
        onChange({[field.name]: [...internalValue, key]})
      }
    } else {
      onChange({[field.name]: internalValue.includes(key) ? undefined : key})
    }
  }

  const onSelectAll = () => {
    const nextValues = options.map(o => o.value);
    onChange({[field.name]: nextValues})
    selectAll();
  }

  const onUnselectAll = () => {
    onChange({[field.name]: undefined});
    unSelectAll();
  }

  let filteredOptions = options.filter(o => !search || filterOption(search, o) || internalValue.includes(o.value))
  if (search && search.length > 0) filteredOptions = filteredOptions.sort(sortByPresenceInArray(internalValue));

  const popoverContent = (
    <>
      {allowSearch && (
        <Input
          ref={selectRef}
          value={search}
          onChange={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={!isFocused ? searchPlaceholder : undefined}
          addonBefore={(
            <div className="wand__inline-filter__search-input__icon-wrapper">
              <SVG src={scopeSvg} height={15} />
            </div>
          )}
          className={`wand__inline-filter__search-input ${isFocused || !!search ? 'wand__inline-filter__search-input--is-focused' : ''}`}
        />
      )}
      <div className="wand__inline-filter__options-container">
        {multiple && !search && (
          <div key='select-all' className={`wand__inline-filter__option ${allSelected ? 'wand__inline-filter__option--is-selected' : ''}`} onClick={allSelected ? onUnselectAll : onSelectAll}>
            <Space>
              <Checkbox indeterminate={partiallySelected} checked={allSelected} />
              {selectAllText}
            </Space>
          </div>
        )}
        {filteredOptions.map(o => (
          <div key={o.value} className={`wand__inline-filter__option ${internalValue?.includes(o.value) ? 'wand__inline-filter__option--is-selected' : ''}`} onClick={() => onSelect(o.value)}>
            <Space>
              {multiple && (
                <Checkbox checked={internalValue?.includes(o.value)} />
              )}
              {o.children || o.label}
            </Space>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <Popover
      showArrow={false}
      open={popoverIsOpen}
      content={popoverContent}
      placement="bottom"
      onOpenChange={setPopoverIsOpen}
      trigger="click"
      overlayClassName="wand__inline-filter__popover"
    >
      <div className={`wand__inline-filter__filter ${internalValue.length > 0 ? 'wand__inline-filter__filter--filled' : ''} ${internalValue.length > 0 || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
        <Space>
          <span className="wand__inline-filter__label">
            {field.label}
            {internalValue.length > 0 && !multiple && (
              <span>
                &nbsp;:&nbsp;{options.find(o => o.value === internalValue[0])?.label}
              </span>
            )}
          </span>
          {internalValue.length > 0 && multiple ? (
            <Badge className="wand__inline-filter__badge" count={internalValue.length} />
          ) : field.icon
          }
        </Space>
      </div>
    </Popover>
  )
}

export default SelectFilter;
